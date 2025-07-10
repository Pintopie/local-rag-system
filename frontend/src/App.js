import React, { useState, useRef, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Paper, TextField, Button, Box, List, ListItem, ListItemText, Modal, Backdrop, Fade, createTheme, ThemeProvider, CssBaseline, IconButton } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const getAppTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: '#e0f2f7',
            paper: '#ffffff',
          },
        }
      : {
          primary: {
            main: '#90caf9',
          },
          secondary: {
            main: '#f48fb1',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
        }),
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '25px',
          textTransform: 'none',
          '&:hover': {
            transform: 'scale(1.05)',
            transition: 'transform 0.3s ease-in-out',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '20px',
            backgroundColor: mode === 'light' ? '#f0f2f5' : '#333333',
            color: mode === 'light' ? 'black' : 'white',
            '& fieldset': {
              borderColor: 'transparent',
            },
            '&:hover fieldset': {
              borderColor: 'transparent',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'transparent',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '15px',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: mode === 'light' ? 'black' : 'white',
        },
      },
    },
  },
});

const modalStyle = (theme) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: 50,
  p: 4,
  borderRadius: '15px',
});

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');
  const theme = getAppTheme(mode);

  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [openModelSelectModal, setOpenModelSelectModal] = useState(false);
  const [initialModelSelected, setInitialModelSelected] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState(null); // New state for typing message
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/models');
        const data = await response.json();
        if (data.models && data.models.length > 0) {
          setModels(data.models);
          if (!selectedModel && !initialModelSelected) {
            setOpenModelSelectModal(true);
          } else if (selectedModel) {
            setCurrentTypingMessage({ role: 'assistant', content: `You are currently chatting with ${selectedModel}.`, displayContent: '' });
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    fetchModels();
  }, [selectedModel, initialModelSelected]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, currentTypingMessage]); // Scroll when chat history or typing message changes

  // Typing animation effect
  useEffect(() => {
    if (currentTypingMessage && currentTypingMessage.displayContent.length < currentTypingMessage.content.length) {
      const typingInterval = setInterval(() => {
        setCurrentTypingMessage(prev => {
          if (!prev) return null;
          const nextCharIndex = prev.displayContent.length + 1;
          const newDisplayContent = prev.content.substring(0, nextCharIndex);
          return { ...prev, displayContent: newDisplayContent };
        });
      }, 20); // Adjust typing speed here (milliseconds per character)

      return () => clearInterval(typingInterval);
    } else if (currentTypingMessage && currentTypingMessage.displayContent.length === currentTypingMessage.content.length) {
      // Typing finished, add to chat history
      setChatHistory(prevHistory => [...prevHistory, currentTypingMessage]);
      setCurrentTypingMessage(null); // Clear typing message
    }
  }, [currentTypingMessage]);

  const handleModelSelect = async (modelName) => {
    setSelectedModel(modelName);
    setOpenModelSelectModal(false);
    setInitialModelSelected(true);
    setCurrentTypingMessage({ role: 'assistant', content: `You are now chatting with ${modelName}.`, displayContent: '' });

    try {
      await fetch('http://localhost:8000/api/set_model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model_name: modelName }),
      });
    } catch (error) {
      console.error('Error setting model on backend:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedModel) return;

    const userMessage = { role: 'user', content: message.trim() };
    setChatHistory(prevHistory => [...prevHistory, userMessage]);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content, model_name: selectedModel }),
      });

      const data = await response.json();
      setCurrentTypingMessage({ role: 'assistant', content: data.response, displayContent: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      setCurrentTypingMessage({ role: 'assistant', content: "Error: Could not get a response.", displayContent: "Error: Could not get a response." });
    }
  };

  const handleCloseModelSelectModal = () => {
    if (initialModelSelected) {
      setOpenModelSelectModal(false);
    }
  };

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <AppBar position="static" color="primary">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Chatbot
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {selectedModel && (
                <Typography variant="subtitle1" sx={{ mr: 2, color: 'white' }}>
                  Model: {selectedModel}
                </Typography>
              )}
              <Button variant="contained" color="secondary" onClick={() => setOpenModelSelectModal(true)}>
                Change Model
              </Button>
              <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Chat History */}
        <Container component="main" maxWidth="md" sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          <Paper elevation={3} sx={{ p: 2, mb: 2, minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            <List sx={{ flexGrow: 1 }}>
              {chatHistory.map((msg, index) => (
                <ListItem key={index} sx={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      maxWidth: '70%',
                      bgcolor: msg.role === 'user' ? theme.palette.primary.main : (mode === 'light' ? '#f0f2f5' : '#333333'),
                      color: msg.role === 'user' ? 'white' : (mode === 'light' ? 'black' : 'white'),
                      borderRadius: '15px',
                      borderTopRightRadius: msg.role === 'user' ? 0 : '15px',
                      borderTopLeftRadius: msg.role === 'assistant' ? 0 : '15px',
                      animation: 'fadeIn 0.5s ease-in-out',
                    }}
                  >
                    <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {msg.role === 'user' ? 'You' : selectedModel}
                    </Typography>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.displayContent || msg.content}</ReactMarkdown>
                    ) : (
                      <ListItemText primary={msg.content} />
                    )}
                  </Paper>
                </ListItem>
              ))}
              {currentTypingMessage && (
                <ListItem sx={{ justifyContent: 'flex-start', mb: 1 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      maxWidth: '70%',
                      bgcolor: mode === 'light' ? '#f0f2f5' : '#333333',
                      color: mode === 'light' ? 'black' : 'white',
                      borderRadius: '15px',
                      borderTopLeftRadius: 0,
                      animation: 'fadeIn 0.5s ease-in-out',
                    }}
                  >
                    <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {selectedModel}
                    </Typography>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentTypingMessage.displayContent}</ReactMarkdown>
                  </Paper>
                </ListItem>
              )}
            </List>
          </Paper>
        </Container>

        {/* Message Input */}
        <AppBar position="static" color="transparent" sx={{ top: 'auto', bottom: 0, bgcolor: 'background.paper', borderTop: '1px solid #e0e0e0' }}>
          <Toolbar sx={{ py: 1.5 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => e.target.value.length <= 500 && setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              sx={{ mr: 2 }}
            />
            <Button variant="contained" color="primary" onClick={sendMessage} sx={{ height: '56px' }}>
              Send
            </Button>
          </Toolbar>
        </AppBar>

        {/* Model Selection Modal */}
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={openModelSelectModal}
          onClose={handleCloseModelSelectModal}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <Fade in={openModelSelectModal}>
            <Box sx={modalStyle(theme)}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography id="transition-modal-title" variant="h6" component="h2">
                  Select an Ollama Model
                </Typography>
                {initialModelSelected && (
                  <IconButton onClick={handleCloseModelSelectModal} color="inherit">
                    <ArrowBackIcon />
                  </IconButton>
                )}
              </Box>
              <List>
                {models.length > 0 ? (
                  models.map((modelName) => (
                    <ListItem button key={modelName} onClick={() => handleModelSelect(modelName)}>
                      <ListItemText primary={modelName} />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No models found. Please ensure Ollama is running and models are pulled." />
                  </ListItem>
                )}
              </List>
              {models.length > 0 && !selectedModel && (
                <Typography variant="caption" color="error">
                  Please select a model to continue.
                </Typography>
              )}
            </Box>
          </Fade>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}

export default App;