import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messagesAPI } from '../api';
import { timeAgo } from '../utils/constants';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeDemand, setActiveDemand] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => {
    if (!activeDemand) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeDemand]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchConversations = async () => {
    try { const res = await messagesAPI.getConversations(); setConversations(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchMessages = async () => {
    if (!activeDemand) return;
    try { const res = await messagesAPI.getForDemand(activeDemand.demand_id); setMessages(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error(err); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeDemand) return;
    setSendLoading(true);
    try {
      await messagesAPI.send({ demand_id: activeDemand.demand_id, receiver_id: activeDemand.other_user?.id, content: newMsg.trim() });
      setNewMsg(''); fetchMessages();
    } catch { alert("Erreur d'envoi"); }
    finally { setSendLoading(false); }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{height:'calc(100vh - 64px)',display:'grid',gridTemplateColumns:'320px 1fr',background:'var(--bg)'}}>
      {/* Conversations panel */}
      <div style={{background:'#fff',borderRight:'1px solid var(--border-light)',overflowY:'auto',padding:14}} className={activeDemand ? 'hidden-mobile' : ''}>
        <div style={{fontSize:15,fontWeight:700,padding:'8px 10px',marginBottom:12,display:'flex',alignItems:'center',gap:8,letterSpacing:'-.3px'}}>💬 Conversations</div>
        {conversations.length === 0 ? (
          <div className="empty-state-sm"><p>Aucune conversation</p></div>
        ) : conversations.map(c => (
          <button key={c.demand_id} onClick={() => setActiveDemand(c)}
            style={{
              display:'flex',justifyContent:'space-between',width:'100%',padding:12,borderRadius:10,border:'none',
              background:activeDemand?.demand_id === c.demand_id ? 'var(--primary-light)' : 'transparent',
              color:'var(--text)',cursor:'pointer',textAlign:'left',transition:'all .15s',marginBottom:2
            }}>
            <div style={{display:'flex',flexDirection:'column',gap:2}}>
              <strong style={{fontSize:14,fontWeight:600}}>{c.other_user?.first_name} {c.other_user?.last_name}</strong>
              <span style={{fontSize:12,color:'var(--primary)',fontWeight:500}}>{c.demand_title}</span>
              <span style={{fontSize:12,color:'var(--text-muted)'}}>{c.last_message?.substring(0, 50)}</span>
            </div>
            <span style={{fontSize:11,color:'var(--text-muted)',whiteSpace:'nowrap'}}>{timeAgo(c.last_message_at)}</span>
          </button>
        ))}
      </div>

      {/* Chat panel */}
      <div style={{display:'flex',flexDirection:'column',background:'var(--bg)'}} className={!activeDemand ? 'hidden-mobile' : ''}>
        {!activeDemand ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--text-muted)',gap:10}}>
            <span style={{fontSize:40}}>💬</span><p style={{fontSize:14}}>Sélectionnez une conversation</p>
          </div>
        ) : (
          <>
            <div style={{padding:'14px 24px',borderBottom:'1px solid var(--border-light)',display:'flex',alignItems:'center',gap:10,background:'#fff'}}>
              <button className="btn-icon show-mobile" onClick={() => setActiveDemand(null)}>←</button>
              <div>
                <strong style={{fontSize:14,fontWeight:600,display:'block'}}>{activeDemand.other_user?.first_name} {activeDemand.other_user?.last_name}</strong>
                <span style={{fontSize:12,color:'var(--text-muted)'}}>{activeDemand.demand_title}</span>
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:24,display:'flex',flexDirection:'column',gap:10}}>
              {messages.map(m => (
                <div key={m.id} style={{
                  maxWidth:'70%',padding:'10px 16px',borderRadius:14,fontSize:14,lineHeight:1.6,
                  alignSelf:m.sender_id === user.id ? 'flex-end' : 'flex-start',
                  background:m.sender_id === user.id ? 'var(--primary)' : '#fff',
                  color:m.sender_id === user.id ? '#fff' : 'var(--text)',
                  border:m.sender_id === user.id ? 'none' : '1px solid var(--border)',
                  borderBottomRightRadius:m.sender_id === user.id ? 4 : 14,
                  borderBottomLeftRadius:m.sender_id === user.id ? 14 : 4,
                }}>
                  <p>{m.content}</p>
                  <span style={{fontSize:11,opacity:.6,display:'block',marginTop:3}}>{timeAgo(m.created_at)}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} style={{display:'flex',gap:10,padding:'14px 24px',borderTop:'1px solid var(--border-light)',background:'#fff'}}>
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Votre message..."
                style={{flex:1,padding:'10px 14px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:14,fontFamily:'inherit',outline:'none'}} />
              <button type="submit" className="btn btn-primary" disabled={sendLoading || !newMsg.trim()}>Envoyer</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
