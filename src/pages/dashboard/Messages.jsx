import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useTenantStore } from '@/store/tenantStore'
import { formatRelative, getInitials, cn } from '@/lib/utils'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function Messages() {
  const { user } = useAuth()
  const { tenants, fetchTenants } = useTenantStore()
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { fetchTenants() }, [])

  useEffect(() => {
    if (!selectedTenant) return
    loadMessages(selectedTenant.id)

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${selectedTenant.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `tenant_id=eq.${selectedTenant.id}`
      }, payload => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [selectedTenant])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async (tenantId) => {
    setLoadingMessages(true)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    // Mark as read
    await supabase.from('messages').update({ is_read: true })
      .eq('tenant_id', tenantId).eq('sender', 'tenant')
    setLoadingMessages(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTenant) return
    setSending(true)
    await supabase.from('messages').insert({
      landlord_id: user.id,
      tenant_id: selectedTenant.id,
      sender: 'landlord',
      body: newMessage.trim(),
    })
    setNewMessage('')
    setSending(false)
  }

  const activeTenants = tenants.filter(t => t.status === 'active')

  return (
    <div className="max-w-5xl">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Messages</h2>
      <div className="card overflow-hidden flex" style={{ height: '70vh' }}>

        {/* Tenant list sidebar */}
        <div className="w-64 border-r border-slate-100 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Tenants</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeTenants.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8 px-4">No active tenants yet.</p>
            ) : activeTenants.map(t => (
              <button key={t.id} onClick={() => setSelectedTenant(t)}
                className={cn('w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50',
                  selectedTenant?.id === t.id ? 'bg-brand-50' : '')}>
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700 flex-shrink-0">
                  {getInitials(t.full_name)}
                </div>
                <div className="min-w-0">
                  <p className={cn('text-sm font-medium truncate', selectedTenant?.id === t.id ? 'text-brand-700' : 'text-slate-800')}>
                    {t.full_name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{t.units?.unit_number ? `Unit ${t.units.unit_number}` : 'Unassigned'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedTenant ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={MessageSquare} title="Select a tenant" description="Choose a tenant from the list to start messaging." />
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700">
                  {getInitials(selectedTenant.full_name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selectedTenant.full_name}</p>
                  <p className="text-xs text-slate-400">{selectedTenant.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {loadingMessages ? <LoadingSpinner className="py-10" /> :
                  messages.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">No messages yet. Send the first one.</div>
                  ) : messages.map(msg => (
                    <div key={msg.id} className={cn('flex', msg.sender === 'landlord' ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm',
                        msg.sender === 'landlord'
                          ? 'bg-brand-500 text-white rounded-br-sm'
                          : 'bg-slate-100 text-slate-800 rounded-bl-sm')}>
                        <p>{msg.body}</p>
                        <p className={cn('text-xs mt-1', msg.sender === 'landlord' ? 'text-brand-200' : 'text-slate-400')}>
                          {formatRelative(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                }
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-100 flex gap-3">
                <input
                  className="input flex-1"
                  placeholder={`Message ${selectedTenant.full_name}…`}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                />
                <button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="btn-primary px-4 gap-2">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
