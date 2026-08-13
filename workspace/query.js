const haystack = (item,collections=[]) => [item.title,item.designConcept,item.prompt,item.exactPhrase,item.age,item.product,item.artStyle,item.character,item.mascot,item.typography,item.palette,item.material,item.production,item.intensity,item.notes,...collections.filter((group)=>item.collectionIds?.includes(group.id)).map((group)=>group.name)].join(' ').toLowerCase()
export function queryPrompts(items,{search='',age='',product='',production='',intensity='',mode='',status='All',collection='',sort='NEWEST'}={},collections=[]) {
  const term=search.trim().toLowerCase()
  const filtered=items.filter((item)=>(!term||haystack(item,collections).includes(term))&&(!age||item.age===age)&&(!product||item.product===product)&&(!production||item.production===production)&&(!intensity||item.intensity===intensity)&&(!mode||item.creationMode===mode)&&(status!=='Favorites'||item.favorite)&&(!collection||item.collectionIds.includes(collection)))
  const sorters={NEWEST:(a,b)=>b.createdAt.localeCompare(a.createdAt),OLDEST:(a,b)=>a.createdAt.localeCompare(b.createdAt),'RECENTLY UPDATED':(a,b)=>b.modifiedAt.localeCompare(a.modifiedAt),'A–Z':(a,b)=>a.title.localeCompare(b.title),'Z–A':(a,b)=>b.title.localeCompare(a.title)}
  return [...filtered].sort(sorters[sort]||sorters.NEWEST)
}
