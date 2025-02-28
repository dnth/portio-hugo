document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const chatContainer = document.getElementById('chat-llm-container');
  const chatToggle = document.getElementById('chat-llm-toggle');
  const chatBox = document.getElementById('chat-llm-box');
  const chatClose = document.getElementById('chat-llm-close');
  const chatMessages = document.getElementById('chat-llm-messages');
  const chatInput = document.getElementById('chat-llm-input');
  const chatSend = document.getElementById('chat-llm-send');
  const whatsappButton = document.querySelector('.chat-llm-social-buttons a[href*="whatsapp"]');
  const telegramButton = document.querySelector('.chat-llm-social-buttons a[href*="telegram"]');
  
  // Check if elements exist (only on pages with the chat component)
  if (!chatContainer) return;
  
  // Variables
  let messages = [
    { role: "system", content: "You are a helpful assistant that answers questions about the current article." },
    { role: "assistant", content: "Hi! I can answer questions about this article. What would you like to know?" }
  ];
  
  // Get page content and metadata
  const pageContent = document.querySelector('.singleBlog__content')?.innerText || '';
  const pageTitle = document.querySelector('.breadCrumb__title')?.innerText || '';
  const pageMetadata = {
    title: pageTitle,
    url: window.location.href,
    tags: Array.from(document.querySelectorAll('.tag-category')).map(tag => tag.innerText),
    publishDate: document.querySelector('.fa-calendar')?.nextSibling?.textContent.trim() || '',
    readingTime: document.querySelector('.fa-clock-o')?.nextSibling?.textContent.trim() || ''
  };
  
  // Update system message with page content
  messages[0].content = `You are a helpful assistant that answers questions about the current article. 
  Here is the article content: 
  Title: ${pageMetadata.title}
  URL: ${pageMetadata.url}
  Tags: ${pageMetadata.tags.join(', ')}
  Published: ${pageMetadata.publishDate}
  Reading Time: ${pageMetadata.readingTime}
  
  Content:
  ${pageContent}
  
  Answer questions based on this content. If the answer is not in the content, say so politely.`;
  
  // Toggle chat box
  chatToggle.addEventListener('click', function() {
    chatBox.style.display = chatBox.style.display === 'none' || chatBox.style.display === '' ? 'flex' : 'none';
  });
  
  // Close chat box
  chatClose.addEventListener('click', function() {
    chatBox.style.display = 'none';
  });
  
  // Track social button clicks
  if (whatsappButton) {
    whatsappButton.addEventListener('click', function() {
      console.log('WhatsApp button clicked');
      // Optional: Add analytics tracking here
    });
  }
  
  if (telegramButton) {
    telegramButton.addEventListener('click', function() {
      console.log('Telegram button clicked');
      // Optional: Add analytics tracking here
    });
  }
  
  // Send message on Enter key (but allow Shift+Enter for new line)
  chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    
    // Auto-resize textarea
    setTimeout(() => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
    }, 0);
  });
  
  // Send message on button click
  chatSend.addEventListener('click', sendMessage);
  
  // Send message function
  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message to UI
    addMessageToUI('user', message);
    
    // Add user message to messages array
    messages.push({ role: "user", content: message });
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Show loading indicator
    const loadingElement = document.createElement('div');
    loadingElement.className = 'chat-llm-loading';
    loadingElement.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(loadingElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Disable input and button while loading
    chatInput.disabled = true;
    chatSend.disabled = true;
    
    // Call API
    callLLMAPI(messages)
      .then(response => {
        // Remove loading indicator
        chatMessages.removeChild(loadingElement);
        
        // Add assistant response to UI
        addMessageToUI('assistant', response);
        
        // Add assistant response to messages array
        messages.push({ role: "assistant", content: response });
        
        // Re-enable input and button
        chatInput.disabled = false;
        chatSend.disabled = false;
        chatInput.focus();
      })
      .catch(error => {
        // Remove loading indicator
        chatMessages.removeChild(loadingElement);
        
        // Add error message to UI
        addMessageToUI('assistant', 'Sorry, there was an error processing your request. Please try again.');
        
        // Re-enable input and button
        chatInput.disabled = false;
        chatSend.disabled = false;
        chatInput.focus();
        
        console.error('Error calling LLM API:', error);
      });
  }
  
  // Add message to UI
  function addMessageToUI(role, content) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-llm-message chat-llm-message-${role}`;
    
    const contentElement = document.createElement('div');
    contentElement.className = 'chat-llm-message-content';
    contentElement.textContent = content;
    
    messageElement.appendChild(contentElement);
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Call LLM API
  async function callLLMAPI(messages) {
    try {
      // Get API key from site config
      const apiKey = window.arliaiApiKey || 'ARLIAI_API_KEY'; // Replace with your actual API key in config.toml
      
      // Make the API call
      const response = await fetch('https://api.arliai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'Mistral-Nemo-12B-Instruct-2407',
          messages: messages,
          repetition_penalty: 1.1,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          max_tokens: 1024,
          stream: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling LLM API:', error);
      
      // Fallback responses for development/testing
      const lastUserMessage = messages.filter(m => m.role === 'user').pop().content.toLowerCase();
      
      if (lastUserMessage.includes('hello') || lastUserMessage.includes('hi')) {
        return "Hello! I'm an LLM assistant. How can I help you with information about this article?";
      } else if (lastUserMessage.includes('thank')) {
        return "You're welcome! Feel free to ask if you have any other questions.";
      } else if (lastUserMessage.includes('what is this article about')) {
        return `This article is about "${pageMetadata.title}". It covers topics related to ${pageMetadata.tags.join(', ')}. Is there something specific you'd like to know about it?`;
      } else {
        return "I'm having trouble connecting to the API right now. Please try again later, or ask a different question.";
      }
    }
  }
}); 