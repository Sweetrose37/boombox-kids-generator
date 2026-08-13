import { emptyWorkspace, normalizeGroup, normalizePrompt, normalizeWorkspace, uid, WORKSPACE_KEY } from './schema.js'

const clone = (value) => JSON.parse(JSON.stringify(value))
const now = () => new Date().toISOString()

export class WorkspaceRepository {
  constructor(storage=globalThis.localStorage) { this.storage=storage; this.data=this.read() }
  read() { try { const current=this.storage?.getItem(WORKSPACE_KEY);if(current)return normalizeWorkspace(JSON.parse(current));const legacy=JSON.parse(this.storage?.getItem('boombox-kids-phase2-saved') || '[]');return normalizeWorkspace({prompts:legacy}) } catch { return emptyWorkspace() } }
  persist() { this.storage?.setItem(WORKSPACE_KEY,JSON.stringify(this.data)); return this.data }
  refresh() { this.data=this.read(); return this.data }
  recent(id) { this.data.recent=[id,...this.data.recent.filter((item)=>item!==id)].slice(0,30) }
  findPrompt(id) { return this.data.prompts.find((item)=>item.id===id) }
  createPrompt(output,state={},mode='Build with BooBoo',extra={}) {
    const prompt = normalizePrompt({ title:output.title, designConcept:output.direction, prompt:output.prompt, age:output.age, product:output.product, production:output.production,
      intensity:state.intensity, artStyle:state.artStyle, character:state.character, mascot:state.mascot, typography:state.typography, palette:state.palette, material:state.material, exactPhrase:state.phrase,
      creationMode:mode, sourcePromptId:state.remixSourceId || '', settings:clone(state), ...extra })
    const duplicate=this.data.prompts.find((item)=>item.prompt===prompt.prompt && item.creationMode===prompt.creationMode)
    if (duplicate) { this.recent(duplicate.id); this.persist(); return { record:duplicate, created:false } }
    this.data.prompts.unshift(prompt); this.recent(prompt.id); this.persist(); return { record:prompt, created:true }
  }
  saveOutput(output,state,mode) {
    if (!Array.isArray(output.items) || !output.items.length) return { ...this.createPrompt(output,state,mode), group:null }
    const promptRecords=output.items.map((item,index)=>this.createPrompt(item,item.settings || state,mode,{ title:item.title || `${output.title} — ${index+1}` }).record)
    const base={ name:output.title, description:output.direction, promptIds:promptRecords.map((item)=>item.id), age:output.age, production:output.production, intensity:state.intensity, sharedDNA:`${state.theme}; ${state.palette}; ${state.typography}; ${state.material}`, sharedTheme:state.theme, sharedPalette:state.palette, sharedMotif:state.theme, coordinatedProducts:output.product, relationship:mode==='Match My Mini' ? state.relationship : '', coordinationLogic:output.direction }
    const listName=mode==='Collection Builder'?'collections':mode==='Match My Mini'?'matchGroups':'outfitSets'
    const existing=this.data[listName].find((group)=>group.name===base.name && group.promptIds.join('|')===base.promptIds.join('|'))
    const group=existing || normalizeGroup(base,listName==='collections'?'collection':listName==='matchGroups'?'match':'outfit')
    if (!existing) this.data[listName].unshift(group)
    promptRecords.forEach((record)=>{ if(listName==='collections' && !record.collectionIds.includes(group.id)) record.collectionIds.push(group.id) })
    this.persist(); return { record:promptRecords[0], records:promptRecords, group, created:!existing }
  }
  updatePrompt(id,updates) { const item=this.findPrompt(id); if(!item)return null; if(typeof updates.title==='string'&&!updates.title.trim())delete updates.title; Object.assign(item,updates,{modifiedAt:now()}); this.recent(id); this.persist(); return item }
  toggleFavorite(id) { const item=this.findPrompt(id); return item ? this.updatePrompt(id,{favorite:!item.favorite}) : null }
  duplicatePrompt(id) { const source=this.findPrompt(id); if(!source)return null; const copy=normalizePrompt({...clone(source),id:uid(),title:this.copyName(source.title,this.data.prompts.map((item)=>item.title)),createdAt:now(),modifiedAt:now(),lastOpenedAt:'',favorite:false,sourcePromptId:source.id}); this.data.prompts.unshift(copy);this.recent(copy.id);this.persist();return copy }
  copyName(title,names) { let name=`${title} — Copy`,index=2; while(names.includes(name))name=`${title} — Copy ${index++}`; return name }
  openPrompt(id) { const item=this.findPrompt(id); if(!item)return null; item.lastOpenedAt=now();this.recent(id);this.persist();return item }
  deletePrompt(id) { this.data.prompts=this.data.prompts.filter((item)=>item.id!==id); for(const list of [this.data.collections,this.data.matchGroups,this.data.outfitSets]) list.forEach((group)=>{group.promptIds=group.promptIds.filter((item)=>item!==id);group.modifiedAt=now()});this.data.recent=this.data.recent.filter((item)=>item!==id);this.persist() }
  groupList(kind) { return this.data[kind] || [] }
  updateGroup(kind,id,updates) { const group=this.groupList(kind).find((item)=>item.id===id);if(!group)return null;if(typeof updates.name==='string'&&!updates.name.trim())delete updates.name;Object.assign(group,updates,{modifiedAt:now()});this.persist();return group }
  duplicateGroup(kind,id) { const source=this.groupList(kind).find((item)=>item.id===id);if(!source)return null;const copy=normalizeGroup({...clone(source),id:uid(),name:this.copyName(source.name,this.groupList(kind).map((item)=>item.name)),createdAt:now(),modifiedAt:now()},kind);this.groupList(kind).unshift(copy);this.persist();return copy }
  deleteGroup(kind,id) { this.data[kind]=this.groupList(kind).filter((item)=>item.id!==id);if(kind==='collections')this.data.prompts.forEach((prompt)=>prompt.collectionIds=prompt.collectionIds.filter((item)=>item!==id));this.persist() }
  addToGroup(kind,id,promptId) { const group=this.groupList(kind).find((item)=>item.id===id);if(group&&!group.promptIds.includes(promptId)){group.promptIds.push(promptId);group.modifiedAt=now();if(kind==='collections')this.findPrompt(promptId)?.collectionIds.push(id);this.persist()} return group }
  removeFromGroup(kind,id,promptId) { const group=this.groupList(kind).find((item)=>item.id===id);if(group){group.promptIds=group.promptIds.filter((item)=>item!==promptId);group.modifiedAt=now();if(kind==='collections'){const prompt=this.findPrompt(promptId);if(prompt)prompt.collectionIds=prompt.collectionIds.filter((item)=>item!==id)}this.persist()} return group }
  moveInGroup(kind,id,promptId,direction) { const group=this.groupList(kind).find((item)=>item.id===id);if(!group)return;const from=group.promptIds.indexOf(promptId),to=from+direction;if(from>=0&&to>=0&&to<group.promptIds.length){group.promptIds.splice(to,0,group.promptIds.splice(from,1)[0]);group.modifiedAt=now();this.persist()} }
  mergeBackup(raw) { if(!raw||typeof raw!=='object'||!['prompts','collections','matchGroups','outfitSets'].some((key)=>Array.isArray(raw[key])))throw new Error('Invalid workspace backup');const incoming=normalizeWorkspace(raw),idMap=new Map(),groupMaps={collections:new Map(),matchGroups:new Map(),outfitSets:new Map()}; for(const prompt of incoming.prompts){const next=clone(prompt);if(this.findPrompt(next.id))next.id=uid();idMap.set(prompt.id,next.id);this.data.prompts.push(next)} for(const kind of ['collections','matchGroups','outfitSets'])for(const group of incoming[kind]){const next=clone(group);if(this.data[kind].some((item)=>item.id===next.id))next.id=uid();groupMaps[kind].set(group.id,next.id);next.promptIds=next.promptIds.map((id)=>idMap.get(id)||id).filter((id)=>this.data.prompts.some((prompt)=>prompt.id===id));this.data[kind].push(next)} for(const prompt of incoming.prompts){const imported=this.findPrompt(idMap.get(prompt.id));if(imported)imported.collectionIds=prompt.collectionIds.map((id)=>groupMaps.collections.get(id)||id).filter((id)=>this.data.collections.some((group)=>group.id===id))}this.data=normalizeWorkspace(this.data);this.persist();return this.data }
}
