import React, { useState } from 'react';
import Input from '../components/Input';
import { loginUser, getUserData } from '../services/api';
import '../styles/Login.css';

interface FormData {
    email: string;
    password: string;
}

interface FormErrors {
    email: string;
    password: string;
}

interface TouchedFields {
    email: boolean;
    password: boolean;
}

interface Validators {
    email: (value: string) => string;
    password: (value: string) => string;
}

const Login: React.FC = () => {
    
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState<FormErrors>({
        email: '',
        password: ''
    });

    const [touched, setTouched] = useState<TouchedFields>({
        email: false,
        password: false
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string>('');

    const validators: Validators = {
        email: (value: string): string => {
            if (!value) return 'Email é obrigatório';
            value = value.trim();
            const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]@[a-zA-Z][-a-zA-Z.]*[a-zA-Z](\.[a-zA-Z]{2,})+$/;
            if (!emailRegex.test(value)) return 'Email inválido';
            return '';
        },
        password: (value: string): string => {
            if (!value) return 'Senha é obrigatória';
            return '';
        }
    };

    const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        
        if (touched[field]) {
            const validationError = validators[field](value);
            setErrors(prev => ({ ...prev, [field]: validationError }));
        }
    };

    const handleBlur = (field: keyof FormData) => () => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const validationError = validators[field](formData[field]);
        setErrors(prev => ({ ...prev, [field]: validationError }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setApiError('');

        setTouched({
            email: true,
            password: true
        });

        const newErrors = {
            email: validators.email(formData.email),
            password: validators.password(formData.password)
        };
        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some(error => error !== '');

        if (!hasErrors) {
            setIsLoading(true);
            try {
                const data = await loginUser(formData);

                const token = data.token;
                const arrayToken = data.token.split('.');
                const tokenPayload = JSON.parse(atob(arrayToken[1]));
                localStorage.setItem('token', token);
                localStorage.setItem('userId', tokenPayload.id);
                
                const userData = await getUserData();
                localStorage.setItem('user', JSON.stringify(userData));
                
                window.location.href = '/home';
                
            } catch (error: any) {
                if (error.message.includes('credenciais')) {
                    setApiError('Email ou senha incorretos');
                } else {
                    setApiError('Erro ao fazer login. Por favor, tente novamente.');
                }
                console.error('Erro no login:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <h1>Cerberus</h1>
            </div>

            <div className="form-container-login">
                {apiError && (
                    <div className="error-message">
                        {apiError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <Input 
                        label="Email" 
                        type="text" 
                        value={formData.email}
                        onChange={handleChange('email')}
                        onBlur={handleBlur('email')}
                        error={errors.email}
                        placeholder="Digite seu email"
                        disabled={isLoading}
                    />
                    
                    <Input 
                        label="Senha" 
                        type="password" 
                        value={formData.password}
                        onChange={handleChange('password')}
                        onBlur={handleBlur('password')}
                        error={errors.password}
                        placeholder="Digite sua senha"
                        disabled={isLoading}
                    />

                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>

                    <div className="create-account-login">
                        <a href="/register">Crie sua conta aqui</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;