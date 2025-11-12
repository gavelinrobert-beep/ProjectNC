import React, { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'

export default function Communications() {
  const [activeChannel, setActiveChannel] = useState('command')
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [priority, setPriority] = useState('normal')
  const [encrypted, setEncrypted] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchChannels()
    fetchMessages(activeChannel)

    // Auto-refresh messages every 3 seconds
    const interval = setInterval(() => {
      fetchMessages(activeChannel)
    }, 3000)

    return () => clearInterval(interval)
  }, [activeChannel])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChannels = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/communications/channels')
      const data = await response.json()
      setChannels(data.channels || [])
    } catch (err) {
      console.error('Failed to fetch channels:', err)
    }
  }

  const fetchMessages = async (channel) => {
    try {
      const response = await fetch(`http://localhost:8000/api/communications/messages/${channel}`)
      const data = await response.json()
      setMessages(data.messages || [])
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const response = await fetch('http://localhost:8000/api/communications/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: activeChannel,
          sender: localStorage.getItem('aegis_role') || 'user',
          content: newMessage,
          priority: priority,
          encrypted: encrypted
        })
      })

      if (response.ok) {
        setNewMessage('')
        setPriority('normal')
        setEncrypted(false)
        fetchMessages(activeChannel)
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Failed to send message')
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4a90e2',
      normal: '#718096',
      high: '#ff9800',
      critical: '#fc8181'
    }
    return colors[priority] || colors.normal
  }

  return (
    <div style={{
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0e14 0%, #1a1f2e 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          📡 Communications
        </h1>
        <div style={{
          padding: '0.5rem 1rem',
          background: '#22543d',
          border: '1px solid #2f855a',
          borderRadius: '8px',
          color: '#68d391',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          🟢 All Systems Operational
        </div>
      </div>

      {/* Channel Selector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {channels.map(channel => (
          <button
            key={channel.id}
            onClick={() => setActiveChannel(channel.id)}
            style={{
              background: activeChannel === channel.id
                ? 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)'
                : 'linear-gradient(180deg, #1a1f2e, #0f1419)',
              border: activeChannel === channel.id ? '2px solid #63b3ed' : '1px solid #2d3748',
              borderRadius: '12px',
              padding: '1rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              color: '#e0e0e0'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{channel.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{channel.name}</div>
            <span style={{
              padding: '0.2rem 0.5rem',
              background: channel.status === 'active' ? '#22543d' : '#744210',
              color: channel.status === 'active' ? '#68d391' : '#f6ad55',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {channel.status}
            </span>
          </button>
        ))}
      </div>

      {/* Chat Interface */}
      <div style={{
        background: 'linear-gradient(180deg, #1a1f2e, #0f1419)',
        border: '1px solid #2d3748',
        borderRadius: '12px',
        height: '600px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #2d3748',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>
            {channels.find(c => c.id === activeChannel)?.icon}
          </span>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
            {channels.find(c => c.id === activeChannel)?.name}
          </h2>
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.85rem',
            color: '#718096'
          }}>
            {messages.length} messages
          </span>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.slice().reverse().map(msg => (
              <div
                key={msg.id}
                style={{
                  background: '#0a0e14',
                  border: `1px solid ${getPriorityColor(msg.priority)}`,
                  borderLeft: `4px solid ${getPriorityColor(msg.priority)}`,
                  borderRadius: '8px',
                  padding: '1rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#63b3ed' }}>
                      {msg.sender}
                    </span>
                    {msg.encrypted && (
                      <span style={{
                        padding: '0.15rem 0.4rem',
                        background: '#2d3748',
                        color: '#68d391',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}>
                        🔒 ENCRYPTED
                      </span>
                    )}
                    {msg.priority !== 'normal' && (
                      <span style={{
                        padding: '0.15rem 0.4rem',
                        background: getPriorityColor(msg.priority),
                        color: '#fff',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {msg.priority}
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#718096' }}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div style={{ color: '#e0e0e0', lineHeight: 1.5 }}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} style={{
          padding: '1.5rem',
          borderTop: '1px solid #2d3748',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: '#718096'
              }}>
                <input
                  type="checkbox"
                  checked={encrypted}
                  onChange={(e) => setEncrypted(e.target.checked)}
                />
                🔒 Encrypted
              </label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#0a0e14',
                  border: '1px solid #2d3748',
                  borderRadius: '6px',
                  color: '#e0e0e0',
                  fontSize: '0.85rem'
                }}
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{
                width: '100%',
                minHeight: '60px',
                padding: '0.75rem',
                background: '#0a0e14',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                color: '#e0e0e0',
                fontSize: '0.95rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              background: newMessage.trim() ? '#63b3ed' : '#2d3748',
              color: newMessage.trim() ? '#0a0e14' : '#718096',
              border: 'none',
              borderRadius: '8px',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              fontSize: '0.95rem',
              fontWeight: 600,
              minHeight: '60px'
            }}
          >
            📤 Send
          </button>
        </form>
      </div>
    </div>
  )
}