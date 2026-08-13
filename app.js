import { initWorkspace } from './ui/workspace.js'
import { completeIntro, introComplete } from './state/session.js'

const menuButton = document.querySelector('.menu-button')
const menuDrawer = document.querySelector('.menu-drawer')
const nowPlaying = document.querySelector('#now-playing')

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true'
  menuButton.setAttribute('aria-expanded', String(!open))
  menuDrawer.setAttribute('aria-hidden', String(open))
  menuDrawer.classList.toggle('is-open', !open)
})

const workspace = initWorkspace()

document.querySelectorAll('[data-mode]').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('[data-mode]').forEach((item) => item.classList.remove('is-selected'))
    card.classList.add('is-selected')
    nowPlaying.textContent = card.dataset.mode
    workspace.openMode(card.dataset.mode)
  })
})

document.querySelectorAll('[data-control]').forEach((control) => {
  control.addEventListener('click', () => {
    document.querySelectorAll('[data-control]').forEach((item) => item.classList.remove('is-active'))
    control.classList.add('is-active')
    workspace.openQuick(control.dataset.control)
  })
})

document.querySelector('.saved-prompts').addEventListener('click', workspace.openSaved)
document.querySelector('[data-menu-home]').addEventListener('click', workspace.closeAll)
document.querySelector('[data-menu-saved]').addEventListener('click', workspace.openSaved)

const guide=document.querySelector('#quick-guide'),intro=document.querySelector('#first-visit'),draft=document.querySelector('#draft-found')
const openOverlay=(element)=>{element.classList.add('is-open');element.setAttribute('aria-hidden','false');document.body.classList.add('dialog-open');element.querySelector('button')?.focus()}
const closeOverlay=(element)=>{element.classList.remove('is-open');element.setAttribute('aria-hidden','true');if(!document.querySelector('.phase6-overlay.is-open'))document.body.classList.remove('dialog-open')}
const openGuide=()=>{closeOverlay(intro);openOverlay(guide)}
document.querySelectorAll('[data-open-guide]').forEach((button)=>button.addEventListener('click',openGuide))
document.querySelectorAll('[data-close-guide]').forEach((button)=>button.addEventListener('click',()=>closeOverlay(guide)))
document.querySelector('[data-guide-create]').addEventListener('click',()=>{completeIntro();closeOverlay(guide);workspace.openMode('Build with BooBoo')})
document.querySelector('[data-intro-start]').addEventListener('click',()=>{completeIntro();closeOverlay(intro);workspace.openMode('Build with BooBoo')})
document.querySelector('[data-intro-guide]').addEventListener('click',()=>{completeIntro();openGuide()})
document.querySelectorAll('[data-skip-intro]').forEach((button)=>button.addEventListener('click',()=>{completeIntro();closeOverlay(intro)}))
document.querySelectorAll('[data-start-fresh]').forEach((button)=>button.addEventListener('click',()=>workspace.startFresh(true)))
document.querySelector('[data-continue-draft]').addEventListener('click',()=>{closeOverlay(draft);workspace.continueDraft()})
document.querySelector('[data-fresh-draft]').addEventListener('click',()=>{closeOverlay(draft);workspace.startFresh(true)})
document.addEventListener('keydown',(event)=>{if(event.key==='Escape'){closeOverlay(guide);closeOverlay(intro)}})
if(workspace.hasDraft())openOverlay(draft)
else if(!introComplete())openOverlay(intro)
