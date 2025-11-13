import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GitHubIcon from "@mui/icons-material/GitHub";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useRef, useState, useContext } from "react";
import { Link } from 'react-router-dom';
import styles from '../login-grid/LoginGrid.module.scss';
import axios from '../../api/axios';
import AuthContext from "../../context/AuthProvider";

import Button from '../buttons/Button';

function LoginForm() {
  const nameRef = useRef();
  const usernameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [activateToken, setActivateToken] = useState(null);
  const [showActivateUrl, setShowActivateUrl] = useState(false);
  const { auth } = useContext(AuthContext);

  const handleRegistrationPost = (event) => {
    event.preventDefault();
    axios
      .post('/auth/register', {
        name: nameRef.current.value,
        username: usernameRef.current.value,
        email: emailRef.current.value,
        hash: passwordRef.current.value,
        confirm_password: confirmPasswordRef.current.value,
      })
      .then((response) => {
        console.log("register response: " + response.data);
        setActivateToken(response.data.activateToken);
        setShowActivateUrl(true);
        // setOpen(true);
        // setMessage('Please check your emails for the activation link');
        // setSeverity('success');
        return;
      })
      .catch((error) => {
        setOpen(true);
        setMessage(error.response.data.error);
        setSeverity('error');
        return;
      });
  };

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
        variant="subtitle1"
        textAlign={"center"}
        className={styles['title']}
        gutterBottom
      >
        Sign up
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
        { showActivateUrl && activateToken && (
          <Link className={styles['link']} to={`/users/activate/${activateToken}`}>
            <Typography>Click here to activate your account</Typography>
          </Link>
        )}
        <form id="registration-form">
          <Typography variant="subtitle1" gutterBottom>
            Name
          </Typography>
          <TextField
            required
            hiddenLabel
            fullWidth
            placeholder="Ex. Melody"
            variant="filled"
            size="small"
            form="registration-form"
            sx={{ marginBottom: 2 }}
            className={styles['input-text']}
            inputRef={nameRef}
          />
          <Typography variant="subtitle1" gutterBottom>
            Username
          </Typography>
          <TextField
            required
            hiddenLabel
            fullWidth
            placeholder="Ex. McSpicy"
            variant="filled"
            size="small"
            form="registration-form"
            sx={{ marginBottom: 2 }}
            className={styles['input-text']}
            inputRef={usernameRef}
          />
          <Typography variant="subtitle1" gutterBottom>
            Email
          </Typography>
          <TextField
            required
            hiddenLabel
            fullWidth
            id="email"
            placeholder="Ex. mcspicy@email.com"
            variant="filled"
            size="small"
            sx={{ marginBottom: 2 }}
            className={styles['input-text']}
            inputRef={emailRef}
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
            inputRef={passwordRef}
          />
          <Typography variant="subtitle1" gutterBottom>
            Confirm Password
          </Typography>
          <TextField
            required
            hiddenLabel
            fullWidth
            id="confirm-password"
            type="password"
            variant="filled"
            size="small"
            sx={{ marginBottom: 2 }}
            className={styles['input-text']}
            inputRef={confirmPasswordRef}
          />
          <Box textAlign={"center"}>
            <Button
              variant="contained"
              id="sign-up-button"
              type="submit"
              category="action"
              title="Sign up"
              isFullWidth={true}
              onClick={handleRegistrationPost} 
            />
          </Box>
          <Box textAlign={"center"} mt={2} mb={2}>
            <Typography
              variant="subtitle1"
              align={"center"}
              display={"inline"}
              paddingX={1}
              gutterBottom
            >
              Already have an account?
            </Typography>
            <Link className={styles['link']} to='/login'>
              <Typography>Log in here</Typography>
            </Link>
          </Box>
        </form>
      </Box>
      <Snackbar open={open} autoHideDuration={6000} onClose={((event, reason) => {
        if (reason === 'timeout') {
          setOpen(false);
        }
      })}>
        <Alert variant="filled" severity={severity} sx={{ width: '100%' }}>{message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default LoginForm;
