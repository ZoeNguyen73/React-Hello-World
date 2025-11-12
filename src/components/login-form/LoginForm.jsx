import React from 'react';
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GitHubIcon from "@mui/icons-material/GitHub";
import Grid from "@mui/material/Grid";
import { Link, useNavigate } from 'react-router-dom';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useRef, useState, useContext} from "react";
import AuthContext from '../../context/AuthProvider';
import styles from '../login-grid/LoginGrid.module.scss';
import axios from '../../api/axios';
import { useCookies } from 'react-cookie';

import Button from '../buttons/Button';

export default function LogInForm() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [cookies, setCookie] = useCookies(); 
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const formObj = {
    usernameRef: useRef(),
    passwordRef: useRef(),
  }

  const loginSubmit = async (evnt) => {
    evnt.preventDefault();
    const username = formObj.usernameRef.current.value;
    const hash = formObj.passwordRef.current.value;

    try {
      const response = await axios.post(
        '/auth/login', 
        { username, hash }
      );
      const {accessToken, refreshToken} = response.data;

      setCookie('refreshToken', refreshToken);
      setCookie('accessToken', accessToken);
      setCookie('username', username);

      setAuth({ accessToken, username });

      setOpen(true);
      setMessage('Login successful. Redirecting to homepage...');
      setSeverity('success');

      navigate('/');

    } catch (err) {
      console.log(err);
      setOpen(true);
      setMessage(err?.response?.data?.error);
      setSeverity('error');
      return
    }
  }

  if (auth?.username) { return (
    <Box className={styles['form']}>
      <Typography
        variant='h4'
        component="h1"
        textAlign={'center'}
        className={styles['title']}
        gutterBottom
      >
        You have logged in as&nbsp;
        <span className='highlight-text'>
          {auth.username}
        </span>
      </Typography>
      <Box textAlign={"center"}>
        <Button
          variant="contained"
          title="Back to homepage" 
          category="action"
          route='/'
        />
        <Button
          variant="outlined"
          title="Open profile" 
          category="action"
          route={`/users/${auth.username}`}
        />
      </Box>
    </Box>
  )}

  return (
    <Box className={styles['form']}>
      <Typography
        variant='h6'
        component="h1"
        textAlign={'center'}
        className={styles['title']}
        gutterBottom
      >
        Log in
      </Typography>
      {/* <Grid container direction="row" justifyContent={"center"}>
        <Grid item>
          <GitHubIcon sx={{ marginY: 1 }} fontSize={"large"} />
        </Grid>
      </Grid>

      <Typography variant="subtitle1" className={styles['or']} gutterBottom>
        <span>or</span>
      </Typography> */}

      <Box
        sx={{
          boxShadow: 7,
          padding: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color1)",
        }}
      >
        <form>
          <Typography variant="subtitle1" gutterBottom>
            Username
          </Typography>
          <TextField
            required
            hiddenLabel
            fullWidth
            variant='filled'
            size='small'
            form='login-form'
            sx={{ marginBottom: 2 }}
            className={styles['input-text']}
            inputRef={formObj.usernameRef}
          />
          <Typography variant="subtitle1" gutterBottom>
            Password
          </Typography>
          <TextField
            required
            hiddenLabel
            fullWidth
            id="password"
            type="password"
            variant="filled"
            size="small"
            sx={{ marginBottom: 2 }}
            className={styles['input-text']}
            inputRef={formObj.passwordRef}
          />
          <Box textAlign={"center"}>
            <Button
              variant="contained"
              title="Log in" 
              category="action"
              isFullWidth={true} 
              onClick={loginSubmit}
            />
          </Box>
        </form>
        <Box textAlign={"center"} mt={2} mb={2}>
          <Typography
            variant="subtitle1"
            align={"center"}
            display={"inline"}
            paddingX={1}
            gutterBottom
          >
            Don't have an account?
            
          </Typography>
          
          <Link className={styles['link']} to='/register'>
            <Typography>Sign up</Typography>
          </Link>
          
        </Box>
        
      </Box>
      <Snackbar open={open} autoHideDuration={6000} onClose={((event, reason) => {
        if (reason === 'timeout') {
          setOpen(false);
        }
      })}>
        <Alert variant="filled" severity={severity} sx={{ width: '100%' }}>{message}</Alert>
      </Snackbar>
    </Box>
  )
}
