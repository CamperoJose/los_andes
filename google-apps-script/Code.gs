const SPREADSHEET_ID = '1QrrRaTMapWgsK_0LbaSdAr79BfhN9DD7ot5mi7gHhJ4';
const CACHE_TTL_PUBLIC = 120;
const CACHE_TTL_ADMIN = 45;
let spreadsheetCache_ = null;

function json(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function adminRequest_(token) {
  if (typeof token !== 'string' || !/^[0-9a-f-]{36}$/i.test(token)) return null;
  const cache = CacheService.getScriptCache();
  const raw = cache.get('admin_session_' + token);
  if (!raw) return null;
  cache.put('admin_session_' + token, raw, 21600);
  return JSON.parse(raw);
}

function doGet(e) {
  try {
    switch (e.parameter.action) {
      case 'oportunidades': return listarOportunidadesPublicas_();
      default: return json({ success: false, message: 'Acción no válida' });
    }
  } catch (error) { return json({ success: false, message: error.message }); }
}

function doPost(e) {
  try {
    const request = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (request.action === 'postular') return registrarPostulacion_(request);
    if (request.action === 'login') return loginAdmin_(request);
    const admin = adminRequest_(request.sessionToken);
    if (!admin) return json({ success: false, message: 'No autorizado' });
    const data = {...request, usuario_id: admin.usuario_id, usuario_revision_id: admin.usuario_id};
    switch (data.action) {
      case 'admin_oportunidades': return listarOportunidadesAdmin_();
      case 'admin_dashboard': return dashboardAdmin_();
      case 'admin_postulaciones': return listarPostulacionesAdmin_();
      case 'logout': CacheService.getScriptCache().remove('admin_session_' + request.sessionToken); return json({success:true});
      case 'guardar_oportunidad': return guardarOportunidad_(data);
      case 'eliminar_oportunidad': return darBajaOportunidad_(data);
      case 'actualizar_postulacion': return actualizarPostulacion_(data);
      default: return json({ success: false, message: 'Acción no válida' });
    }
  } catch (error) { return json({ success: false, message: error.message }); }
}

function ss_() {
  if (!spreadsheetCache_) spreadsheetCache_ = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheetCache_;
}
function sheet_(name) { const sheet = ss_().getSheetByName(name); if (!sheet) throw new Error('No existe la hoja ' + name); return sheet; }

// Solo trae filas reales: formato, checkboxes y FALSE en filas vacías ya no inflan cada lectura.
function tableValues_(sheetName) {
  const sheet = sheet_(sheetName);
  const lastColumn = sheet.getLastColumn();
  const physicalLastRow = sheet.getLastRow();
  if (lastColumn < 1 || physicalLastRow < 1) return [];
  if (physicalLastRow === 1) return [sheet.getRange(1, 1, 1, lastColumn).getValues()[0]];
  const ids = sheet.getRange(2, 1, physicalLastRow - 1, 1).getDisplayValues();
  let dataRows = 0;
  for (let i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0] || '').trim() !== '') { dataRows = i + 1; break; }
  }
  return sheet.getRange(1, 1, dataRows + 1, lastColumn).getValues();
}

function rowsAsObjects_(sheetName) {
  const values = tableValues_(sheetName);
  if (values.length < 2) return [];
  const headers = values[0].map(value => String(value).trim());
  return values.slice(1).filter(row => String(row[0] == null ? '' : row[0]).trim() !== '')
    .map(row => Object.fromEntries(headers.map((header, index) => [header, jsonValue_(row[index])])));
}
function jsonValue_(value) { return Object.prototype.toString.call(value) === '[object Date]' ? Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss") : value; }
function bool_(value) { return value === true || String(value).trim().toUpperCase() === 'TRUE' || String(value).trim() === '1' || String(value).trim().toUpperCase() === 'SI'; }
function clean_(value) { const text = String(value == null ? '' : value).trim(); return /^[=+\-@]/.test(text) ? "'" + text : text; }
function today_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
function cacheGet_(key) { const raw = CacheService.getScriptCache().get(key); if (!raw) return null; try { return JSON.parse(raw); } catch (_) { return null; } }
function cachePut_(key, value, ttl) { try { CacheService.getScriptCache().put(key, JSON.stringify(value), ttl); } catch (_) {} }
function invalidateReadCaches_() { CacheService.getScriptCache().removeAll(['public_oportunidades_v2','admin_oportunidades_v2','admin_dashboard_v2','admin_postulaciones_v2']); }

function esPublicable_(oportunidad) {
  if (!bool_(oportunidad.visible) || String(oportunidad.estado || '').trim().toUpperCase() !== 'ABIERTA') return false;
  if (oportunidad.fecha_cierre) { const cierre = String(oportunidad.fecha_cierre).substring(0, 10); if (cierre && cierre < today_()) return false; }
  return true;
}

function listarOportunidadesPublicas_() {
  const key = 'public_oportunidades_v2'; const cached = cacheGet_(key); if (cached) return json(cached);
  const data = rowsAsObjects_('oportunidades').filter(esPublicable_).sort((a,b) => Number(a.orden || 999) - Number(b.orden || 999));
  const result = { success: true, data }; cachePut_(key, result, CACHE_TTL_PUBLIC); return json(result);
}
function listarOportunidadesAdmin_() {
  const key = 'admin_oportunidades_v2'; const cached = cacheGet_(key); if (cached) return json(cached);
  const data = rowsAsObjects_('oportunidades').map(item => ({...item, visible: bool_(item.visible), estado: String(item.estado || '').trim().toUpperCase() || 'CERRADA', orden: Number(item.orden || 999)})).sort((a,b)=>a.orden-b.orden);
  const result = { success: true, data }; cachePut_(key, result, CACHE_TTL_ADMIN); return json(result);
}

function loginAdmin_(data) {
  const usuario = clean_(data.usuario).toLowerCase(); const contrasena = String(data.contrasena || '');
  if (!usuario || !contrasena) return json({ success:false, message:'Completa usuario y contraseña' });
  const found = rowsAsObjects_('usuarios').find(user =>
    String(user.usuario || '').trim().toLowerCase() === usuario &&
    String(user.contrasena || '') === contrasena &&
    bool_(user.activo) && String(user.rol || '').trim().toUpperCase() === 'ADMIN'
  );
  if (!found) return json({success:false,message:'Usuario o contraseña incorrectos'});
  const sessionToken = Utilities.getUuid();
  CacheService.getScriptCache().put('admin_session_' + sessionToken, JSON.stringify({usuario_id:found.usuario_id}), 21600);
  return json({success:true,user:{usuario_id:found.usuario_id,usuario:found.usuario,nombres:found.nombres,apellidos:found.apellidos,rol:'ADMIN'},sessionToken});
}

function guardarOportunidad_(data) {
  ['titulo','area','modalidad','ubicacion','descripcion_corta'].forEach(field => { if (!clean_(data[field])) throw new Error('Campo obligatorio: ' + field); });
  const sheet = sheet_('oportunidades'); const values = tableValues_('oportunidades'); const oportunidadId = clean_(data.oportunidad_id) || siguienteOportunidadId_(values);
  const rowIndex = values.findIndex((row,index)=>index>0 && String(row[0])===oportunidadId);
  const row = [oportunidadId,clean_(data.titulo),clean_(data.area),clean_(data.modalidad),clean_(data.ubicacion),clean_(data.descripcion_corta),clean_(data.descripcion_detalle),clean_(data.requisitos),bool_(data.visible),['ABIERTA','CERRADA'].includes(String(data.estado||'').toUpperCase())?String(data.estado).toUpperCase():'CERRADA',Number(data.orden||999),clean_(data.fecha_publicacion)||today_(),clean_(data.fecha_cierre)];
  if (rowIndex>=1) sheet.getRange(rowIndex+1,1,1,row.length).setValues([row]); else sheet.appendRow(row);
  invalidateReadCaches_(); audit_(clean_(data.usuario_id),rowIndex>=1?'ACTUALIZAR':'CREAR','oportunidad',oportunidadId,clean_(data.titulo));
  return json({success:true,data:{oportunidad_id:oportunidadId},message:rowIndex>=1?'Cargo actualizado':'Cargo creado'});
}
function siguienteOportunidadId_(values) { let max=0; values.slice(1).forEach(row=>{const match=String(row[0]||'').match(/^OP-(\d+)$/);if(match)max=Math.max(max,Number(match[1]));}); return 'OP-'+String(max+1).padStart(3,'0'); }
function darBajaOportunidad_(data) {
  const id=clean_(data.oportunidad_id); if(!id)throw new Error('oportunidad_id es obligatorio'); const sheet=sheet_('oportunidades'); const values=tableValues_('oportunidades');
  const rowIndex=values.findIndex((row,index)=>index>0&&String(row[0])===id); if(rowIndex<1)throw new Error('Cargo no encontrado');
  sheet.getRange(rowIndex+1,9).setValue(false); sheet.getRange(rowIndex+1,10).setValue('CERRADA'); if(!sheet.getRange(rowIndex+1,13).getValue())sheet.getRange(rowIndex+1,13).setValue(today_());
  invalidateReadCaches_(); audit_(clean_(data.usuario_id),'BAJA','oportunidad',id,String(values[rowIndex][1]||'')); return json({success:true,message:'Cargo dado de baja'});
}

function registrarPostulacion_(data) {
  ['oportunidad_id','nombres','apellidos','email','experiencia'].forEach(field=>{if(!clean_(data[field]))throw new Error('Campo obligatorio: '+field);});
  const oportunidad=rowsAsObjects_('oportunidades').find(item=>String(item.oportunidad_id)===String(data.oportunidad_id)); if(!oportunidad||!esPublicable_(oportunidad))throw new Error('La oportunidad ya no está disponible');
  const email=clean_(data.email).toLowerCase(); if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Correo electrónico inválido');
  const lock=LockService.getScriptLock(); lock.waitLock(5000); try { const postulanteId=Utilities.getUuid(), postulacionId=Utilities.getUuid(), now=new Date();
    sheet_('postulantes').appendRow([postulanteId,clean_(data.nombres),clean_(data.apellidos),email,clean_(data.telefono),clean_(data.ciudad),now,clean_(data.genero),clean_(data.fecha_nacimiento)]);
    sheet_('postulaciones').appendRow([postulacionId,postulanteId,data.oportunidad_id,'NUEVA',now,'','','','']);
    sheet_('experiencias').appendRow([Utilities.getUuid(),postulanteId,'','','','',false,clean_(data.experiencia)]);
    if(clean_(data.educacion))sheet_('educaciones').appendRow([Utilities.getUuid(),postulanteId,'','','','','',clean_(data.educacion)]);
    invalidateReadCaches_(); return json({success:true,postulacion_id:postulacionId,message:'Postulación registrada correctamente'});
  } finally { lock.releaseLock(); }
}

function groupDescriptions_(rows) { const grouped={}; rows.forEach(item=>{const id=String(item.postulante_id||'');if(!id||!item.descripcion)return;if(!grouped[id])grouped[id]=[];grouped[id].push(item.descripcion);}); return grouped; }
function listarPostulacionesAdmin_() {
  const key='admin_postulaciones_v2', cached=cacheGet_(key); if(cached)return json(cached);
  const postulantes=rowsAsObjects_('postulantes'), postulaciones=rowsAsObjects_('postulaciones'), oportunidades=rowsAsObjects_('oportunidades');
  const postulanteMap=Object.fromEntries(postulantes.map(item=>[String(item.postulante_id),item])), oportunidadMap=Object.fromEntries(oportunidades.map(item=>[String(item.oportunidad_id),item]));
  const experienciaMap=groupDescriptions_(rowsAsObjects_('experiencias')), educacionMap=groupDescriptions_(rowsAsObjects_('educaciones'));
  const data=postulaciones.map(postulacion=>{const pid=String(postulacion.postulante_id),p=postulanteMap[pid]||{},o=oportunidadMap[String(postulacion.oportunidad_id)]||{};return {...postulacion,nombres:p.nombres||'',apellidos:p.apellidos||'',email:p.email||'',telefono:p.telefono||'',ciudad:p.ciudad||'',genero:p.genero||'',fecha_nacimiento:p.fecha_nacimiento||'',cargo:o.titulo||postulacion.oportunidad_id,experiencia:(experienciaMap[pid]||[]).join('\n'),educacion:(educacionMap[pid]||[]).join('\n')};}).sort((a,b)=>String(b.fecha_postulacion||'').localeCompare(String(a.fecha_postulacion||'')));
  const result={success:true,data}; cachePut_(key,result,CACHE_TTL_ADMIN); return json(result);
}

function actualizarPostulacion_(data) {
  const id=clean_(data.postulacion_id), estado=String(data.estado||'').trim().toUpperCase(), permitidos=['NUEVA','EN REVISION','PRESELECCIONADO','ENTREVISTA','FINALISTA','DESCARTADO','CONTRATADO'];
  if(!id||!permitidos.includes(estado))throw new Error('Datos de actualización inválidos'); const sheet=sheet_('postulaciones'), values=tableValues_('postulaciones'); const rowIndex=values.findIndex((row,index)=>index>0&&String(row[0])===id); if(rowIndex<1)throw new Error('Postulación no encontrada');
  const puntaje = String(data.puntaje_evaluacion == null ? '' : data.puntaje_evaluacion).trim();
  if (puntaje && (!Number.isFinite(Number(puntaje)) || Number(puntaje)<0 || Number(puntaje)>100)) throw new Error('El puntaje debe estar entre 0 y 100');
  sheet.getRange(rowIndex+1,4).setValue(estado); sheet.getRange(rowIndex+1,6).setValue(clean_(data.observaciones)); sheet.getRange(rowIndex+1,7).setValue(clean_(data.usuario_revision_id)); invalidateReadCaches_();
  sheet.getRange(rowIndex+1,8,1,2).setValues([[puntaje ? Number(puntaje) : '',clean_(data.test_risc)]]);
  audit_(clean_(data.usuario_revision_id),'CAMBIAR_ESTADO','postulacion',id,estado+(clean_(data.observaciones)?' · '+clean_(data.observaciones):'')); return json({success:true,message:'Postulación actualizada'});
}

function dashboardAdmin_() {
  const key='admin_dashboard_v2', cached=cacheGet_(key); if(cached)return json(cached); const oportunidades=rowsAsObjects_('oportunidades'), postulaciones=rowsAsObjects_('postulaciones');
  const oportunidadMap=Object.fromEntries(oportunidades.map(item=>[String(item.oportunidad_id),item])), porCargoMap={};
  oportunidades.forEach(item=>{const id=String(item.oportunidad_id);porCargoMap[id]={oportunidad_id:id,cargo:item.titulo||id,total:0,nueva:0,entrevista:0,finalista:0,contratado:0};});
  postulaciones.forEach(item=>{const id=String(item.oportunidad_id);if(!porCargoMap[id])porCargoMap[id]={oportunidad_id:id,cargo:(oportunidadMap[id]&&oportunidadMap[id].titulo)||id,total:0,nueva:0,entrevista:0,finalista:0,contratado:0};porCargoMap[id].total++;const estado=String(item.estado||'').toUpperCase();if(estado==='NUEVA')porCargoMap[id].nueva++;if(estado==='ENTREVISTA')porCargoMap[id].entrevista++;if(estado==='FINALISTA')porCargoMap[id].finalista++;if(estado==='CONTRATADO')porCargoMap[id].contratado++;});
  const estados={}; postulaciones.forEach(item=>{const estado=String(item.estado||'NUEVA').toUpperCase();estados[estado]=(estados[estado]||0)+1;});
  const result={success:true,data:{resumen:{cargos_total:oportunidades.length,cargos_abiertos:oportunidades.filter(esPublicable_).length,cargos_visibles:oportunidades.filter(item=>bool_(item.visible)).length,postulaciones_total:postulaciones.length,pendientes:(estados['NUEVA']||0)+(estados['EN REVISION']||0)},estados,por_cargo:Object.values(porCargoMap).sort((a,b)=>b.total-a.total||String(a.cargo).localeCompare(String(b.cargo)))}};
  cachePut_(key,result,CACHE_TTL_ADMIN); return json(result);
}

function audit_(usuarioId,accion,entidad,entidadId,detalle) {
  try { sheet_('auditoria').appendRow([Utilities.getUuid(),new Date(),clean_(usuarioId),clean_(accion),clean_(entidad),clean_(entidadId),clean_(detalle)]); } catch (_) {}
}
