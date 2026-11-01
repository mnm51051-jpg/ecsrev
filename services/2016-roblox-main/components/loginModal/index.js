import { useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { login } from '../../services/auth';
import { getBaseUrl } from '../../lib/request';

const useLoginModalStyles = createUseStyles({
  wrapper: {
    position: 'absolute',
    display: 'block',
    right: '10px',
    top: '45px',
    boxShadow: '0 5px 10px rgb(0 0 0 / 20%)',
    zIndex: 99,
    borderRadius: '3px',
  },
  card: {
    width: '320px',
    background: 'white',
    paddingTop: '20px',
    paddingBottom: '20px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  input: {
    fontSize: '16px',
    margin: '10px 0',
    width: '280px',
  },
  btn: {
    width: '100%',
    color: 'white',
    fontWeight: 400,
    transition: 'none',
    '&:hover': {
      color: 'white',
      transition: 'none',
      boxShadow: '0 1px 3px rgb(150 150 150 / 74%)',
    },
  },
  btnPrimary: {
    background: '#00A2FF',
    '&:hover': {
      background: '#32B5FF',
    },
  },
  btnSecondary: {
    color: '#757575',
    border: '1px solid #B8B8B8',
    '&:hover': {
      color: '#757575',
    },
  },
  forgotPass: {
    color: '#00A2FF',
  },
});

const LoginModal = () => {
  const s = useLoginModalStyles();
  const userRef = useRef(null);
  const passRef = useRef(null);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState(null);

  const onLoginSubmit = async event => {
    event.preventDefault();
    if (locked) return;

    setError(null);
    setLocked(true);
    try {
      await login({
        username: userRef.current.value.trim(),
        password: passRef.current.value,
      });
      window.location.reload();
    } catch (loginError) {
      setError(loginError.response?.data?.errors?.[0]?.message || loginError.response?.data?.message || loginError.message || 'Unable to sign in. Please try again.');
    } finally {
      setLocked(false);
    }
  };

  return <div className={s.wrapper}>
    <div className={s.card}>
      <p className='small text-muted mb-2'>Use your Economy Simulator account. Never enter a Roblox password or session cookie.</p>
      {error && <p role='alert' className='text-danger mb-0'>{error}</p>}
      <form onSubmit={onLoginSubmit}>
        <label className='form-label mb-0' htmlFor='nav-login-username'>Username</label>
        <input id='nav-login-username' name='username' autoComplete='username' required disabled={locked} ref={userRef} className={`form-control ${s.input}`} type='text' />
        <label className='form-label mb-0' htmlFor='nav-login-password'>Password</label>
        <input id='nav-login-password' name='password' autoComplete='current-password' required disabled={locked} ref={passRef} className={`form-control ${s.input}`} type='password' />
        <div className='row'>
          <div className='col-6'>
            <button type='submit' disabled={locked} className={`btn ${s.btnPrimary} ${s.btn}`}>Log In</button>
          </div>
          <div className='col-6'>
            <a href={new URL('/auth/application', getBaseUrl()).toString()} className={`btn ${s.btnSecondary} ${s.btn}`}>Sign up</a>
          </div>
        </div>
      </form>
      <div className='row mt-2'>
        <div className='col-12'>
          <p>
            <a className={s.forgotPass} href={new URL('/auth/password-reset', getBaseUrl()).toString()}>Forgot Password?</a>
          </p>
        </div>
      </div>
    </div>
  </div>
}

export default LoginModal;
