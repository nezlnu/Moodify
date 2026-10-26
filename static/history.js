const list = document.getElementById('historyList');
const clearButton = document.getElementById('clearHistory');
function message(text) { list.replaceChildren(); const p=document.createElement('p'); p.textContent=text; list.append(p); }
async function renderHistory() {
    try {
        const response=await fetch('/api/history/');
        if(response.status===401) { message('Log in to view and save your listening history.'); return; }
        if(!response.ok) throw new Error();
        const {history}=await response.json(); list.replaceChildren();
        if(!history.length) { message('Your history is empty. Go to Home and discover a playlist!'); return; }
        history.forEach(entry=>{
            const card=document.createElement('article'); card.className='history-item';
            const heading=document.createElement('h3'); heading.textContent='Moodify playlist'; card.append(heading);
            for(const text of [`Mood: ${entry.mood}`,`Activity: ${entry.activity}`,`Energy: ${entry.energy}`,`Opened: ${new Date(entry.date).toLocaleString()}`]) { const p=document.createElement('p'); p.textContent=text; card.append(p); }
            const link=document.createElement('a'); link.href=entry.playlist.replace('/embed/','/'); link.textContent='Open on Spotify'; link.target='_blank'; link.rel='noopener noreferrer'; card.append(link); list.append(card);
        });
    } catch { message('Could not load history. Please refresh and try again.'); }
}
clearButton.addEventListener('click',async()=>{
    if(!confirm('Clear your listening history?')) return;
    try {
        const response=await fetch('/api/history/',{method:'DELETE',headers:{'X-CSRFToken':document.querySelector('[name=csrfmiddlewaretoken]').value}});
        if(!response.ok) throw new Error();
        await renderHistory();
    } catch { message('Could not clear history. Please try again.'); }
});
renderHistory();
