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
    <div style={{height:'calc(100vh - 54px)',display:'grid',gridTemplateColumns:'300px 1fr',background:'#f8f8fa'}}>
      {/* Conversations panel */}
      <div style={{background:'#fff',borderRight:'.5px solid #ededf0',overflowY:'auto',padding:12}} className={activeDemand ? 'hidden-mobile' : ''}>
        <div style={{fontSize:14,fontWeight:500,padding:'6px 8px',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>💬 Conversations</div>
        {conversations.length === 0 ? (
          <div className="empty-state-sm"><p>Aucune conversation</p></div>
        ) : conversations.map(c => (
          <button key={c.demand_id} onClick={() => setActiveDemand(c)}
            style={{display:'flex',justifyContent:'space-between',width:'100%',padding:10,borderRadius:6,border:'none',
              background:activeDemand?.demand_id === c.demand_id ? '#EEEDFE' : 'transparent',
              color:'#1a1a1a',cursor:'pointer',textAlign:'left',transition:'all .1s',marginBottom:2}}>
            <div style={{display:'flex',flexDirection:'column',gap:1}}>
              <strong style={{fontSize:13,fontWeight:500}}>{c.other_user?.first_name} {c.other_user?.last_name}</strong>
              <span style={{fontSize:11,color:'#534AB7'}}>{c.demand_title}</span>
              <span style={{fontSize:11,color:'#9a9aa5'}}>{c.last_message?.substring(0, 50)}</span>
            </div>
            <span style={{fontSize:10,color:'#9a9aa5',whiteSpace:'nowrap'}}>{timeAgo(c.last_message_at)}</span>
          </button>
        ))}
      </div>

      {/* Chat panel */}
      <div style={{display:'flex',flexDirection:'column',background:'#f8f8fa'}} className={!activeDemand ? 'hidden-mobile' : ''}>
        {!activeDemand ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:'#9a9aa5',gap:8}}>
            <span style={{fontSize:32}}>💬</span><p style={{fontSize:13}}>Sélectionnez une conversation</p>
          </div>
        ) : (
          <>
            <div style={{padding:'12px 20px',borderBottom:'.5px solid #ededf0',display:'flex',alignItems:'center',gap:8,background:'#fff'}}>
              <button className="btn-icon show-mobile" onClick={() => setActiveDemand(null)}>←</button>
              <div>
                <strong style={{fontSize:13,fontWeight:500,display:'block'}}>{activeDemand.other_user?.first_name} {activeDemand.other_user?.last_name}</strong>
                <span style={{fontSize:11,color:'#9a9aa5'}}>{activeDemand.demand_title}</span>
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:8}}>
              {messages.map(m => (
                <div key={m.id} style={{
                  maxWidth:'70%',padding:'9px 14px',borderRadius:12,fontSize:13,lineHeight:1.5,
                  alignSelf:m.sender_id === user.id ? 'flex-end' : 'flex-start',
                  background:m.sender_id === user.id ? '#534AB7' : '#fff',
                  color:m.sender_id === user.id ? '#fff' : '#1a1a1a',
                  border:m.sender_id === user.id ? 'none' : '.5px solid #ededf0',
                  borderBottomRightRadius:m.sender_id === user.id ? 4 : 12,
                  borderBottomLeftRadius:m.sender_id === user.id ? 12 : 4,
                }}>
                  <p>{m.content}</p>
                  <span style={{fontSize:10,opacity:.6,display:'block',marginTop:2}}>{timeAgo(m.created_at)}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} style={{display:'flex',gap:8,padding:'12px 20px',borderTop:'.5px solid #ededf0',background:'#fff'}}>
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Votre message..."
                style={{flex:1,padding:'9px 12px',background:'#f8f8fa',border:'.5px solid #ededf0',borderRadius:6,color:'#1a1a1a',fontSize:13,fontFamily:'inherit',outline:'none'}} />
              <button type="submit" className="btn btn-primary" disabled={sendLoading || !newMsg.trim()}>Envoyer</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
