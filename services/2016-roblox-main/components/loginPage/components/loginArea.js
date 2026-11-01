import { useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { login } from "../../../services/auth";
import useButtonStyles from "../../../styles/buttonStyles";
import ActionButton from "../../actionButton";

const useStyles = createUseStyles({
    header: {
        fontSize: '35px',
    },
    input: {
        width: 'calc(100% - 90px)',
        display: 'inline-block',
    },
    inputLabel: {
        width: '90px',
        display: 'inline-block',
        color: '#343434',
    },
    signInButtonWrapper: {
        float: 'right',
    },
    loginWrapper: {
        maxWidth: '325px',
    }
});

const LoginArea = () => {
    const buttonStyles = useButtonStyles();
    const s = useStyles();
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const [locked, setLocked] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const onLoginSubmit = async event => {
        event.preventDefault();
        if (locked) return;

        setFeedback(null);
        setLocked(true);
        try {
            await login({
                username: usernameRef.current.value.trim(),
                password: passwordRef.current.value,
            });
            window.location.assign('/home');
        } catch (error) {
            setFeedback(error.response?.data?.errors?.[0]?.message || error.response?.data?.message || error.message || 'Unable to sign in. Please try again.');
        } finally {
            setLocked(false);
        }
    };

    return <div className='row'>
        <div className='col-12'>
            <h1 className={s.header}>Sign in to Economy Simulator</h1>
            <p className='small text-muted'>Use your Economy Simulator account. Never enter a Roblox password or session cookie.</p>
            {feedback && <p role='alert' className='mb-2 mt-1 text-danger'>{feedback}</p>}
        </div>
        <div className='col-12'>
            <div className={'ms-4 me-4 ' + s.loginWrapper}>
                <form onSubmit={onLoginSubmit}>
                    <div>
                        <label className={s.inputLabel} htmlFor='login-username'>Username:</label>
                        <div className={s.input}>
                            <input id='login-username' name='username' autoComplete='username' required disabled={locked} type='text' className='w-100' ref={usernameRef} />
                        </div>
                    </div>
                    <div className='mt-2'>
                        <label className={s.inputLabel} htmlFor='login-password'>Password:</label>
                        <div className={s.input}>
                            <input id='login-password' name='password' autoComplete='current-password' required disabled={locked} type='password' className='w-100' ref={passwordRef} />
                        </div>
                    </div>
                    <div className='mt-2'>
                        <div className={s.signInButtonWrapper}>
                            <ActionButton type='submit' disabled={locked} label='Sign In' className={buttonStyles.continueButton} />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
}

export default LoginArea;
