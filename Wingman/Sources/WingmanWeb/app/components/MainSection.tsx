"use client";
import React, { useState, useEffect, useRef } from 'react';

// Type definitions
interface MainSectionProps {
  provider?: string;
}

interface AIConnection {
  id: string;
  apiKey: string;
  apiProvider: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  provider?: string;
}

interface Chat {
  id: string;
  name: string;
  timestamp: string;
  messages: Message[];
}

interface Attachment {
  id: string;
  name: string;
  url: string;
}

interface Prompt {
  id: string;
  name: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export default function MainSection({ provider = 'AI' }: MainSectionProps) {
  // State variables
  const [mindInput, setMindInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState<boolean>(false);
  const [chatHistoryError, setChatHistoryError] = useState<string | null>(null);
  const [renameChatId, setRenameChatId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState<string>('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState<boolean>(false);
  const [showArrows, setShowArrows] = useState<boolean>(false);
  const [leftArrowDisabled, setLeftArrowDisabled] = useState<boolean>(true);
  const [rightArrowDisabled, setRightArrowDisabled] = useState<boolean>(false);
  const [aiConnections, setAiConnections] = useState<AIConnection[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [isLoadingAiConnections, setIsLoadingAiConnections] = useState<boolean>(false);
  const [providers, setProviders] = useState<Array<{ id: string; name: string }>>([]);
  
  // Ref variables
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mindInputRef = useRef<HTMLTextAreaElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const promptsScrollRef = useRef<HTMLDivElement>(null);

  // Load AI connections from API
  const loadAiConnections = async (): Promise<void> => {
    console.log('Starting to load AI connections...');
    setIsLoadingAiConnections(true);
    try {
      const response = await fetch('/api/account', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth-token') || ''}`
        }
      });
      
      console.log('AI connections API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('AI connections API response data:', data);
        if (data.user?.aiConnections) {
          console.log('AI connections found:', data.user.aiConnections);
          setAiConnections(data.user.aiConnections);
          // Set first connection as default if none selected
          if (data.user.aiConnections.length > 0 && !selectedProvider) {
            console.log('Setting default provider:', data.user.aiConnections[0].apiProvider);
            setSelectedProvider(data.user.aiConnections[0].apiProvider);
          }
        } else {
          console.log('No AI connections in response');
        }
      } else {
        console.error('AI connections API request failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error loading AI connections:', error);
    } finally {
      setIsLoadingAiConnections(false);
      console.log('Finished loading AI connections');
    }
  };

  // Load providers from API
  useEffect(() => {
    const loadProviders = async () => {
      console.log('Starting to load providers...');
      try {
        const response = await fetch('/api/providers');
        console.log('Provider API response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Provider API response data:', data);
          if (data.providers) {
            const formattedProviders = data.providers.map((provider: any) => ({
              id: provider.id,
              name: provider.name
            }));
            console.log('Formatted providers:', formattedProviders);
            setProviders(formattedProviders);
          } else {
            console.log('No providers in response');
            setProviders([]);
          }
        } else {
          console.error('Provider API request failed with status:', response.status);
          setProviders([]);
        }
      } catch (error) {
        console.error('Error loading providers:', error);
        // Fallback to empty array if loading fails
        setProviders([]);
      } finally {
        console.log('Finished loading providers');
      }
    };
    
    loadProviders();
  }, []);

  // Load chat history from API on component mount
  useEffect(() => {
    loadChatHistory();
    loadPrompts();
    loadAiConnections();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenu) {
        // Check if the click is outside the menu
        const menuElement = document.querySelector('.absolute.right-0.top-full.mt-1.bg-white');
        const buttonElement = document.querySelector(`button[aria-label="More options"]`);
        
        if (menuElement && !menuElement.contains(event.target as Node) && 
            buttonElement && !buttonElement.contains(event.target as Node)) {
          setOpenMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenu]);

  // Load prompts from API
  const loadPrompts = async (): Promise<void> => {
    console.log('Starting to load prompts...');
    setIsLoadingPrompts(true);
    try {
      const response = await fetch('/api/prompts');
      console.log('Prompts API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Prompts API response data:', data);
        if (data.prompts) {
          console.log('Prompts found:', data.prompts.length);
          setPrompts(data.prompts);
        } else {
          console.log('No prompts in response');
          setPrompts([]);
        }
      } else {
        console.error('Prompts API request failed with status:', response.status);
        setPrompts([]);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      setPrompts([]);
    } finally {
      setIsLoadingPrompts(false);
      console.log('Finished loading prompts');
    }
  };

  // Handle scroll events for prompts
  const handlePromptsScroll = (): void => {
    if (promptsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = promptsScrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      
      // Update arrow disabled states
      setLeftArrowDisabled(scrollLeft <= 0);
      setRightArrowDisabled(scrollLeft >= maxScroll);
    }
  };

  // Check if prompts fit in scroll view
  useEffect(() => {
    setTimeout(() => {
      if (promptsScrollRef.current) {
        const { scrollWidth, clientWidth } = promptsScrollRef.current;
        setShowArrows(scrollWidth > clientWidth);
        
        // Initial state
        setLeftArrowDisabled(true);
        setRightArrowDisabled(scrollWidth <= clientWidth);
      }
    }, 100);
  }, [prompts]);

  // Scroll prompts left
  const scrollPromptsLeft = (): void => {
    if (promptsScrollRef.current) {
      promptsScrollRef.current.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  // Scroll prompts right
  const scrollPromptsRight = (): void => {
    if (promptsScrollRef.current) {
      promptsScrollRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  // Load chat history from API
  const loadChatHistory = async (): Promise<void> => {
    console.log('Starting to load chat history...');
    setIsLoadingChats(true);
    setChatHistoryError(null);
    
    try {
      const response = await fetch('/api/chats');
      console.log('Chat history API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Chat history API response data:', data);
        if (data.chats) {
          console.log('Chats found:', data.chats.length);
          // Ensure all messages in all chats have a provider field
          const chatsWithProvider = data.chats.map((chat: any) => ({
            ...chat,
            messages: (chat.messages || []).map((msg: any) => ({
              ...msg,
              provider: msg.provider || 'qwen-plus' // Default provider fallback
            }))
          }));
          setChats(chatsWithProvider);
          
          if (chatsWithProvider.length === 0) {
            // If no existing chats, initialize a new chat session
            console.log('No existing chats, initializing new chat session');
            handleNewChat();
          } else {
            // If chat history is not empty, load the last chat by default
            const lastChat = chatsWithProvider[0]; // Chats are ordered by timestamp DESC in API
            console.log('Loading last chat:', lastChat.id, lastChat.name);
            setActiveChatId(lastChat.id);
            setMessages(lastChat.messages || []);
            
            // Scroll to the bottom of the chat to show the latest message
            setTimeout(() => {
              if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
              }
            }, 100);
          }
        } else {
          // If no chats property in response, initialize a new chat session
          console.log('No chats property in response, initializing new chat session');
          handleNewChat();
        }
      } else {
        console.error('Chat history API request failed with status:', response.status);
        throw new Error('Failed to load chat history');
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setChatHistoryError('Failed to load chat history');
    } finally {
      setIsLoadingChats(false);
      console.log('Finished loading chat history');
    }
  };

  // Handle new chat creation
  const handleNewChat = (): void => {
    // Reset chat section and text field
    setMessages([]);
    setMindInput('');
    setAttachments([]);
    setActiveChatId(null);
    
    // Activate "What's in your mind?" text field for keyboard input
    setTimeout(() => {
      if (mindInputRef.current) {
        mindInputRef.current.focus();
      }
    }, 100);
  };

  // Handle menu toggle
  const handleMenuToggle = (chatId: string): void => {
    setOpenMenu(openMenu === chatId ? null : chatId);
    setRenameChatId(null);
  };

  // Handle rename chat
  const handleRenameChat = (chatId: string): void => {
    // Open rename input
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setRenameChatId(chatId);
      setRenameInput(chat.name);
      setOpenMenu(null);
      
      // Focus on rename input
      setTimeout(() => {
        if (renameInputRef.current) {
          renameInputRef.current.focus();
          renameInputRef.current.select();
        }
      }, 100);
    }
  };

  // Handle rename submit
  const handleRenameSubmit = async (chatId: string): Promise<void> => {
    if (!renameInput.trim()) {
      // Display error for empty name
      alert('Chat name cannot be empty');
      return;
    }

    try {
      // Rename chat via API
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'rename',
          id: chatId,
          name: renameInput.trim()
        }),
      });

      if (response.ok) {
        // Update local state
        setChats(chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              name: renameInput.trim()
            };
          }
          return chat;
        }));

        // Close rename input
        setRenameChatId(null);
        setRenameInput('');
      } else {
        console.error('Failed to rename chat');
      }
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  // Handle delete chat
  const handleDeleteChat = async (chatId: string): Promise<void> => {
    // Show confirmation dialog
    if (confirm('Are you sure you want to permanently delete this chat?')) {
      try {
        // Call API to delete chat
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'delete',
            id: chatId
          }),
        });

        if (response.ok) {
          // Update local state
          const updatedChats = chats.filter(chat => chat.id !== chatId);
          setChats(updatedChats);
          if (activeChatId === chatId) {
            setActiveChatId(null);
            setMessages([]);
          }
          // Don't create a new chat automatically - wait until user sends first message
          // This aligns with documentation that "New Chat" should not be displayed until AI response is received
        } else {
          console.error('Failed to delete chat');
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
    setOpenMenu(null);
  };

  // Handle chat selection
  const handleChatSelect = async (chatId: string): Promise<void> => {
    // Select existing chat functionality
    setActiveChatId(chatId);
    
    try {
      // Find the chat in local state
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setMessages(chat.messages || []);
        
        // Scroll to the bottom of the chat to show the latest message
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error retrieving chat history:', error);
      // If error occurs, still use local messages
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setMessages(chat.messages || []);
        
        // Scroll to the bottom of the chat to show the latest message
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    }
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files;
    console.log('Files selected:', files);
    if (files && files.length > 0) {
      const newAttachments: Attachment[] = [];
      
      // Use Promise.all to handle multiple file reads asynchronously
      const fileReadPromises = Array.from(files).map((file) => {
        return new Promise<void>((resolve, reject) => {
          console.log('Processing file:', file.name);
          try {
            // Read file content as data URL
            const reader = new FileReader();
            reader.onload = (event) => {
              const fileContent = event.target?.result as string;
              console.log('File content read:', fileContent.substring(0, 100) + '...');
              
              // Add file to attachments
              newAttachments.push({
                id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                url: fileContent
              });
              console.log('Added file to attachments:', file.name);
              resolve();
            };
            reader.onerror = async (error) => {
              console.error('Error reading file:', error);
              // Fallback to upload if reading fails
              try {
                const attachment = await uploadFile(file);
                newAttachments.push(attachment);
                resolve();
              } catch (error) {
                reject(error);
              }
            };
            reader.readAsDataURL(file);
          } catch (error) {
            console.error('Error processing file:', error);
            // Fallback to upload if reading fails
            uploadFile(file).then((attachment) => {
              newAttachments.push(attachment);
              resolve();
            }).catch(reject);
          }
        });
      });
      
      // Wait for all file reads to complete
      try {
        await Promise.all(fileReadPromises);
        console.log('All files processed');
        console.log('New attachments:', newAttachments);
        console.log('Current attachments:', attachments);
        const updatedAttachments = [...attachments, ...newAttachments];
        console.log('Updated attachments:', updatedAttachments);
        setAttachments(updatedAttachments);
        console.log('Attachments state updated');
      } catch (error) {
        console.error('Error processing files:', error);
      }
    }
    
    // Reset file input value to allow selecting the same file again
    e.target.value = '';
  };
  
  // Helper function to upload file to server
  const uploadFile = async (file: File): Promise<Attachment> => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file to server
      console.log('Uploading file:', file.name);
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token') || ''}`
        },
        body: formData
      });
      
      console.log('Upload response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Upload response data:', data);
        if (data.success) {
          // Return uploaded file as attachment
          const attachment: Attachment = {
            id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: data.filename,
            url: data.fileUrl
          };
          console.log('Created attachment for uploaded file:', data.filename);
          return attachment;
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    
    // Fallback to local blob URL if upload fails
    const fallbackAttachment: Attachment = {
      id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file)
    };
    console.log('Created fallback attachment for file:', file.name);
    return fallbackAttachment;
  };

  // Handle attachment deletion
  const handleDeleteAttachment = (attachmentId: string): void => {
    setAttachments(attachments.filter(attachment => attachment.id !== attachmentId));
  };

  // Handle prompt click
  const handlePromptClick = (promptText: string): void => {
    if (mindInputRef.current) {
      const textArea = mindInputRef.current;
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const currentValue = textArea.value;
      
      // Insert prompt text at cursor position
      const newValue = currentValue.substring(0, start) + promptText + currentValue.substring(end);
      setMindInput(newValue);
      
      // Set focus back to text area and select the inserted text
      setTimeout(() => {
        if (mindInputRef.current) {
          mindInputRef.current.focus();
          mindInputRef.current.setSelectionRange(start, start + promptText.length);
        }
      }, 100);
    }
  };

  // Handle message sending
  const sendMessage = async (): Promise<void> => {
    if (!mindInput.trim() && attachments.length === 0) return;

    try {
      setSending(true);
      setChatError(null);

      const prompt = mindInput.trim();

      // Create user message object with attachments if present
      let messageContent = prompt || 'Please analyze the attached files';
      
      // Add attachment information to the message content
      console.log('Attachments before sending:', attachments);
      if (attachments.length > 0) {
        // Include file data URLs directly in the message content
        const attachmentInfo = attachments.map(attach => `[${attach.name}](${attach.url})`).join(' ');
        messageContent += `\n\nPlease analyze the attached files:\n${attachmentInfo}`;
        console.log('Message content with attachments:', messageContent);
      }
      
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: messageContent,
        role: 'user',
        timestamp: new Date().toISOString()
      };

      // Create updated messages array including new user message
      const updatedMessages: Message[] = [...messages, userMessage];

      // Add user message to chat
      setMessages(updatedMessages);

      // Clear text field immediately after sending
      setMindInput('');
      setAttachments([]);

      // Scroll to bottom
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);

      // Create messages array with full conversation history
      const conversationMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Send request to AI API with full conversation history
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationMessages,
          provider: selectedProvider
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          // Create assistant message object
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            content: data.response,
            role: 'assistant',
            timestamp: new Date().toISOString(),
            provider: selectedProvider
          };

          // Add assistant message to chat
          const finalMessages: Message[] = [...updatedMessages, assistantMessage];
          setMessages(finalMessages);

          // Check if this is the first message in the current chat
          const currentChat = chats.find(chat => chat.id === activeChatId);
          console.log('Debug chat name generation:');
          console.log('activeChatId:', activeChatId);
          console.log('currentChat:', currentChat);
          console.log('currentChat.messages.length:', currentChat?.messages.length);
          console.log('chats:', chats);
          // Check if it's a new chat (currentChat is undefined but activeChatId exists) or if messages is empty
          const isFirstMessage = (!currentChat && activeChatId) || (currentChat && currentChat.messages.length === 0);
          console.log('isFirstMessage:', isFirstMessage);
          if (isFirstMessage && activeChatId) {
            // This is the first message in an automatically created chat
            // Generate appropriate name for the chat based on context
            let chatName = 'New chat';
            if (prompt.length > 0) {
              // Generate chat name based on both user prompt and assistant response for better context
              // Use first 20 characters of the prompt plus a hint from the assistant response
              let contextBasedName = prompt.substring(0, 20);
              if (data.response) {
                // Extract a short meaningful phrase from the assistant response
                const responseSummary = data.response.substring(0, 30).replace(/[^a-zA-Z0-9\s]/g, '');
                if (responseSummary.length > 10) {
                  contextBasedName += `: ${responseSummary.substring(0, 15)}`;
                }
              }
              chatName = contextBasedName;
              if (chatName.length > 30) {
                chatName = chatName.substring(0, 30) + '...';
              }
            }
            
            // Update the chat name via API
            await fetch('/api/chats', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'rename',
                id: activeChatId,
                name: chatName
              }),
            });
            
            // Update local state with the new chat name
            setChats(chats.map(chat => {
              if (chat.id === activeChatId) {
                return {
                  ...chat,
                  name: chatName
                };
              }
              return chat;
            }));
            
            // Add user message to chat
            await fetch('/api/chats', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'addMessage',
                chatId: activeChatId,
                content: userMessage.content,
                role: userMessage.role,
                provider: 'user'
              }),
            });
            
            // Add assistant message to chat
            await fetch('/api/chats', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'addMessage',
                chatId: activeChatId,
                content: assistantMessage.content,
                role: assistantMessage.role,
                provider: assistantMessage.provider
              }),
            });
            
            // Update local state with new messages
            setChats(chats.map(chat => {
              if (chat.id === activeChatId) {
                return {
                  ...chat,
                  messages: finalMessages,
                  timestamp: new Date().toISOString()
                };
              }
              return chat;
            }));
          } else if (messages.length === 0 && !activeChatId) {
            // Create new chat if this is the first message and no active chat
            // Generate appropriate name for the new chat based on context
            let chatName = 'New chat';
            if (prompt.length > 0) {
              // Generate chat name based on both user prompt and assistant response for better context
              // Use first 20 characters of the prompt plus a hint from the assistant response
              let contextBasedName = prompt.substring(0, 20);
              if (data.response) {
                // Extract a short meaningful phrase from the assistant response
                const responseSummary = data.response.substring(0, 30).replace(/[^a-zA-Z0-9\s]/g, '');
                if (responseSummary.length > 10) {
                  contextBasedName += `: ${responseSummary.substring(0, 15)}`;
                }
              }
              chatName = contextBasedName;
              if (chatName.length > 30) {
                chatName = chatName.substring(0, 30) + '...';
              }
            }
            
            // Create new chat via API
            const chatResponse = await fetch('/api/chats', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'create',
                name: chatName
              }),
            });
            
            if (chatResponse.ok) {
              const chatData = await chatResponse.json();
              const newChat = chatData.chat;
              
              // Add user message to chat
            await fetch('/api/chats', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'addMessage',
                chatId: newChat.id,
                content: userMessage.content,
                role: userMessage.role,
                provider: 'user'
              }),
            });
              
              // Add assistant message to chat
              await fetch('/api/chats', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  action: 'addMessage',
                  chatId: newChat.id,
                  content: assistantMessage.content,
                  role: assistantMessage.role,
                  provider: assistantMessage.provider
                }),
              });
              
              // Update local state with new chat
              setChats([{...newChat, messages: finalMessages}, ...chats]);
              setActiveChatId(newChat.id);
            }
          } else if (activeChatId) {
            // Add user message to existing chat via API
            await fetch('/api/chats', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'addMessage',
                chatId: activeChatId,
                content: userMessage.content,
                role: userMessage.role,
                provider: 'user'
              }),
            });
            
            // Add assistant message to existing chat via API
            await fetch('/api/chats', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'addMessage',
                chatId: activeChatId,
                content: assistantMessage.content,
                role: assistantMessage.role,
                provider: assistantMessage.provider
              }),
            });
            
            // Update existing active chat with new messages
            setChats(chats.map(chat => {
              if (chat.id === activeChatId) {
                return {
                  ...chat,
                  messages: finalMessages,
                  timestamp: new Date().toISOString() // Update timestamp to now
                };
              }
              return chat;
            }));
          }

          // Scroll to bottom
          setTimeout(() => {
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
          }, 100);
        } else {
          setChatError('No response received from AI provider');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setChatError(errorData.error || 'Failed to get response from AI provider');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatError((error as Error).message || 'An error occurred while sending your message');
    } finally {
      setSending(false);
      
      // Activate "What's in your mind?" text field for keyboard input
      setTimeout(() => {
        if (mindInputRef.current) {
          mindInputRef.current.focus();
        }
      }, 100);
    }
  };

  // Focus on "What's in your mind?" text field on component mount
  useEffect(() => {
    if (mindInputRef.current) {
      mindInputRef.current.focus();
    }
  }, []);

  return (
    <>
      <main className="flex-1 bg-gray-50 px-[6px] py-5">
      <div className="flex flex-col md:flex-row gap-[6px] h-full">
        {/* Left Column: Chat History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full md:w-[300px] h-[719px] overflow-hidden flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat History</h2>
          
          {/* Chat History List */}
          <div className="flex-1 overflow-hidden">
            {isLoadingChats ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chats...</div>
              </div>
            ) : chatHistoryError ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="text-red-600 mb-4">{chatHistoryError}</div>
                <button
                  onClick={loadChatHistory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="text-gray-500 mb-4">No chats yet. Start a new conversation!</div>
              </div>
            ) : (
              <div className="space-y-2 h-full overflow-y-auto pr-2">
                {chats.map((chat) => (
                  <div key={chat.id} className="relative">
                    {/* Chat Item */}
                    <div
                      data-testid="chat-history-item"
                      className={`h-[50px] flex items-center justify-between px-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${activeChatId === chat.id ? 'bg-blue-50 border-blue-300' : ''}`}
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      {renameChatId === chat.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            ref={renameInputRef}
                            type="text"
                            value={renameInput}
                            onChange={(e) => setRenameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRenameSubmit(chat.id);
                              } else if (e.key === 'Escape') {
                                setRenameChatId(null);
                                setRenameInput('');
                              }
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => handleRenameSubmit(chat.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setRenameChatId(null);
                              setRenameInput('');
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <span data-testid="chat-name" className="text-gray-800 truncate">{chat.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuToggle(chat.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="More options"
                          >
                            ...
                          </button>
                        </>
                      )}
                    </div>
                    
                    {/* Dropdown Menu */}
                    {openMenu === chat.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleRenameChat(chat.id)}
                        >
                          Rename
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(chat.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* New Chat Button - at bottom, 4px to bottom edge */}
          <div className="mt-auto mb-1 flex justify-end">
            <button
              onClick={handleNewChat}
              className="h-[40px] w-[40px] flex items-center justify-center bg-transparent hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="New chat"
            >
              <img src="/Resources/icon_prmp_new.svg" alt="New chat" className="w-[20px] h-[20px]" />
            </button>
          </div>
        </div>

        {/* Right Column: Chat Interface */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-[6px] w-full md:w-[882px] h-[719px] flex flex-col">
          <div className="mb-0">
            {/* Chat display */}
            <div 
              ref={chatContainerRef}
              className="w-full h-[508px] border border-gray-300 rounded-lg px-[6px] py-2 overflow-y-auto"
              role="region"
              aria-label="Chat messages"
            >
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user' 
                          ? 'bg-blue-100 text-gray-800' 
                          : 'bg-gray-100 text-gray-800'}`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <div className="mt-1 text-xs text-gray-500 flex justify-between items-center">
                          <span>{message.role === 'assistant' ? message.provider || selectedProvider || provider : 'You'}, {new Date(message.timestamp).toLocaleTimeString()}, {new Date(message.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <button 
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => navigator.clipboard.writeText(message.content)}
                            aria-label="Copy message"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {sending && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800">
                    <p className="text-gray-500">{selectedProvider || provider} is typing...</p>
                  </div>
                </div>
              )}
              
              {chatError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {chatError}
                </div>
              )}
            </div>
          </div>
          {/* Predefined Prompts Section */}
          <div className="mt-2 mb-0">
            <div className="flex items-center">
              {/* Prompts Scroll View */}
              <div className="relative w-[800px] mr-[15px]">
                {/* Left Arrow */}
                {showArrows && (
                  <button
                    onClick={scrollPromptsLeft}
                    disabled={leftArrowDisabled}
                    className={`absolute left-0 top-[15px] -translate-y-1/2 bg-white rounded-full p-1 shadow-md z-10 ${leftArrowDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Scroll left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                
                <div 
                  ref={promptsScrollRef}
                  onScroll={handlePromptsScroll}
                  className={`overflow-x-auto pb-2 ${showArrows ? 'pl-10 pr-10' : 'pl-4 pr-4'}`} 
                  style={{ scrollbarWidth: 'none' }}
                >
                  <div className="flex gap-2 min-w-max">
                    {isLoadingPrompts ? (
                      <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-[30px] px-4 bg-white border border-gray-200 rounded-full animate-pulse"></div>
                        ))}
                      </div>
                    ) : prompts.length === 0 ? (
                      <div className="text-sm text-gray-500 h-[30px] flex items-center">
                        No predefined prompts
                      </div>
                    ) : (
                      prompts.map((prompt) => (
                        <button
                          key={prompt.id}
                          onClick={() => handlePromptClick(prompt.text)}
                          className="h-[30px] px-4 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-sm text-gray-700 whitespace-nowrap"
                          title={prompt.name}
                        >
                          # {prompt.name.length > 20 ? prompt.name.substring(0, 20) + ' ...' : prompt.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Right Arrow */}
                {showArrows && (
                  <button
                    onClick={scrollPromptsRight}
                    disabled={rightArrowDisabled}
                    className={`absolute right-0 top-[15px] -translate-y-1/2 bg-white rounded-full p-1 shadow-md z-10 ${rightArrowDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Scroll right"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Manage Prompts Button */}
              <button
                onClick={() => window.location.href = '/prompts'}
                className="h-[30px] w-[30px] bg-white border border-gray-200 rounded-full hover:bg-gray-50 flex items-center justify-center"
                title="Manage prompts"
                aria-label="Manage prompts"
              >
                <img src="/Resources/icon_settings.svg" alt="Manage" className="w-[20px] h-[20px]" />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative w-full h-[150px] border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  <div className="px-[6px] py-[3px] text-sm text-gray-500">What&apos;s in your mind?</div>
                  {/* Attachments display area */}
                  {attachments.length > 0 && (
                    <div className="px-[6px] py-1 flex flex-wrap gap-2">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="relative">
                          <div className="w-[40px] h-[40px] bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                            {/* Check if the file is an image */}
                            {attachment.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                              <img 
                                src={attachment.url} 
                                alt={attachment.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs truncate w-full text-center">{attachment.name.substring(0, 8)}</span>
                            )}
                          </div>
                          <button
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            onClick={() => handleDeleteAttachment(attachment.id)}
                            aria-label={`Delete attachment ${attachment.name}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea
                    ref={mindInputRef}
                    value={mindInput}
                    onChange={(e) => setMindInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="w-full h-[120px] px-[6px] pt-[2px] pb-1 resize-none border-0 rounded-lg focus:outline-none"
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    {/* AI Provider Dropdown */}
                    <div className="relative">
                      <select
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="h-8 bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-colors px-2 text-sm border border-gray-300"
                        aria-label="AI Provider"
                      >
                        {/* Filter providers to only those in user's AI connections */}
                        {(() => {
                          // Debug logs
                          console.log('Available providers:', providers);
                          console.log('User AI connections:', aiConnections);
                          
                          // Check if we have any AI connections
                          if (aiConnections.length === 0) {
                            console.log('No AI connections available');
                            return <option value="">No AI connections</option>;
                          }
                          
                          // Create a set of user provider IDs for quick lookup
                          const userProviderIds = new Set(
                            aiConnections.map(connection => connection.apiProvider)
                          );
                          console.log('User provider IDs:', Array.from(userProviderIds));
                          
                          // Get all providers that are in the user's connections
                          const userProviders = providers.filter(provider => 
                            userProviderIds.has(provider.id)
                          );
                          
                          console.log('Filtered user providers:', userProviders);
                          
                          // If no matching providers found, show all AI connections
                          if (userProviders.length === 0) {
                            console.log('No matching providers found, showing all AI connections');
                            return aiConnections.map((connection) => (
                              <option key={connection.id} value={connection.apiProvider}>
                                {connection.apiProvider}
                              </option>
                            ));
                          }
                          
                          return userProviders.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                              {provider.name}
                            </option>
                          ));
                        })()}
                      </select>
                    </div>
                    
                    {/* Use a real file input with label styled as button */}
                    <label 
                      className="w-8 h-8 bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer"
                      htmlFor="file-upload"
                      aria-label="Attach file"
                    >
                      <img src="/Resources/icon_upload.svg" alt="Attachment" className="w-[20px] h-[20px]" />
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <button 
                      className={`w-8 h-8 bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center ${((!mindInput.trim() && attachments.length === 0) && !sending) ? 'opacity-40 cursor-not-allowed' : ''}`}
                      onClick={sendMessage}
                      disabled={sending || (!mindInput.trim() && attachments.length === 0)}
                      aria-label="Send message"
                    >
                      <img src="/Resources/icon_send.svg" alt="Send" className="w-[20px] h-[20px]" />
                    </button>
                  </div>
                </div>

          </div>

        </div>
      </div>






    </main>


    </>
  );
}
