import React, { useState, useEffect } from 'react';
import { registerUser, loginUser, getUserData } from '../services/api';
import Input from '../components/Input';
import '../styles/Register.css';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from "framer-motion";
import { IonContent } from '@ionic/react';

interface FormData {
    email: string;
    cpf: string;
    username: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    email: string;
    cpf: string;
    username: string;
    password: string;
    confirmPassword: string;
}

interface TouchedFields {
    email: boolean;
    cpf: boolean;
    username: boolean;
    password: boolean;
    confirmPassword: boolean;
}

interface Validators {
    email: (value: string) => string;
    cpf: (value: string) => string;
    username: (value: string) => string;
    password: (value: string) => string;
    confirmPassword: (value: string, password: string) => string;
}

const Register: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        cpf: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<FormErrors>({
        email: '',
        cpf: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [touched, setTouched] = useState<TouchedFields>({
        email: false,
        cpf: false,
        username: false,
        password: false,
        confirmPassword: false
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const [navigationError, setNavigationError] = useState<string>('');
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
    const [isShowConfirm, setIsShowConfirm] = useState<boolean>(false);


    const validators: Validators = {
        email: (value: string): string => {
            if (!value) return 'O campo de email não pode estar vazio';
        
            value = value.trim();
        
            const atCount = (value.match(/@/g) || []).length;
            if (atCount !== 1) return 'Formato de email inválido: deve conter exatamente um @';
        
            const [localPart, domain] = value.split('@');
        
            if (!localPart || localPart.length < 3) return 'A parte local do email deve ter pelo menos 3 caracteres';
            if (localPart.length > 64) return 'A parte local do email é muito longa (máx. 64 caracteres)';
        
            const localPartRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/;
            if (!localPartRegex.test(localPart)) {
                return 'Email deve possuir apenas letras, números, pontos ou underline no nome e domínio';
            }
        
            if (!domain) return 'O domínio do email está ausente';
            if (domain.length > 255) return 'O domínio do email é muito longo';
            if (!domain.includes('.')) return 'O domínio deve conter pelo menos um ponto';
        
            const domainRegex = /^[a-zA-Z][-a-zA-Z.]*[a-zA-Z](\.[a-zA-Z]{2,})+$/;
            if (!domainRegex.test(domain)) {
                return 'Formato de domínio inválido';
            }
        
            if (value.includes('..') || value.includes('--') || value.includes('__')) {
                return 'Email não pode conter sequências de caracteres especiais';
            }
        
            if (/^[._-]|[._-]$/.test(localPart)) {
                return 'Email não pode começar ou terminar com caracteres especiais';
            }
        
            const suspiciousPatterns = [
                /[^a-zA-Z0-9]{3,}/
            ];
        
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(value)) {
                    return 'Formato de email inválido';
                }
            }
        
            return '';
        },

        cpf: (value: string): string => {
            const cpfClean = value.replace(/\D/g, '');
            
            if (!cpfClean) return 'O campo de CPF não pode estar vazio';
            if (cpfClean.length !== 11) return 'CPF deve conter exatamente 11 dígitos';
            
            if (/^(\d)\1{10}$/.test(cpfClean)) return 'CPF inválido: dígitos repetidos não são permitidos';
            
            let sum = 0;
            let remainder;
            
            for (let i = 1; i <= 9; i++) {
                sum = sum + parseInt(cpfClean.substring(i - 1, i)) * (11 - i);
            }
            
            remainder = (sum * 10) % 11;
            if (remainder === 10 || remainder === 11) remainder = 0;
            if (remainder !== parseInt(cpfClean.substring(9, 10))) return 'CPF inválido: dígito verificador incorreto';
            
            sum = 0;
            for (let i = 1; i <= 10; i++) {
                sum = sum + parseInt(cpfClean.substring(i - 1, i)) * (12 - i);
            }
            
            remainder = (sum * 10) % 11;
            if (remainder === 10 || remainder === 11) remainder = 0;
            if (remainder !== parseInt(cpfClean.substring(10, 11))) return 'CPF inválido: dígito verificador incorreto';
            
            return '';
        },

        username: (value: string): string => {
            if (!value) return 'O campo de username não pode estar vazio';
            if (value.length < 3) return 'Username deve ter no mínimo 3 caracteres';
            if (value.length > 20) return 'Username deve ter no máximo 20 caracteres';
            if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username deve conter apenas letras, números e _ (underline)';
            return '';
        },

        password: (value: string): string => {
            if (!value) return 'O campo de senha não pode estar vazio';
            if (value.length < 8) return 'Senha deve ter no mínimo 8 caracteres';
            if (value.length > 32) return 'Senha deve ter no máximo 32 caracteres';
        
            const allowedCharsRegex = /^[a-zA-Z0-9!@#$%^&*]+$/;
            if (!allowedCharsRegex.test(value)) {
                return 'Senha contém caracteres não permitidos';
            }
        
            if (!/[A-Z]/.test(value)) return 'Adicione pelo menos uma letra maiúscula';
            if (!/[a-z]/.test(value)) return 'Adicione pelo menos uma letra minúscula';
            if (!/[0-9]/.test(value)) return 'Adicione pelo menos um número';
            if (!/[!@#$%^&*]/.test(value)) return 'Adicione pelo menos um símbolo especial (!@#$%^&*)';
        
            if (/(.)\1{2,}/.test(value)) {
                return 'Evite repetir o mesmo caractere mais de 2 vezes';
            }
        
            if (/\s/.test(value)) {
                return 'Senha não pode conter espaços';
            }
        
            for (let i = 0; i < value.length; i++) {
                if (value.charCodeAt(i) > 127) {
                    return 'Senha não pode conter emojis ou caracteres especiais não ASCII';
                }
            }
        
            return '';
        },

        confirmPassword: (value: string, password: string): string => {
            if (!value) return 'Confirme sua senha';
            if (value !== password) return 'As senhas não coincidem';
            return '';
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        event.preventDefault();
        setApiError('');
        setSuccessMessage('');
        
        const allTouched = Object.keys(touched).reduce(
            (acc, key) => ({ ...acc, [key as keyof TouchedFields]: true }), 
            {} as TouchedFields
        );
        setTouched(allTouched);

        const newErrors = {
            email: validators.email(formData.email),
            cpf: validators.cpf(formData.cpf.replace(/\D/g, '')),
            username: validators.username(formData.username),
            password: validators.password(formData.password),
            confirmPassword: validators.confirmPassword(
                formData.confirmPassword, 
                formData.password
            )
        };

        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some(error => error !== '');
        
        if (!hasErrors) {
            setIsLoading(true);
            try {
                const userData = {
                    email: formData.email,
                    cpf: formData.cpf.replace(/\D/g, ''),
                    username: formData.username,
                    password: formData.password,
                };

                const response = await registerUser(userData);
                setFormSubmitted(true);
                
                setFormData({
                    email: '',
                    cpf: '',
                    username: '',
                    password: '',
                    confirmPassword: ''
                });

                setTouched({
                    email: false,
                    cpf: false,
                    username: false,
                    password: false,
                    confirmPassword: false
                });

                setErrors({
                    email: '',
                    cpf: '',
                    username: '',                
                    password: '',
                    confirmPassword: ''
                });

                const loginResponse = await loginUser({
                    email: userData.email,
                    password: userData.password
                });
                                
                const arrayToken = loginResponse.token.split('.');
                const tokenPayload = JSON.parse(atob(arrayToken[1]));
                localStorage.setItem('token', loginResponse.token);
                localStorage.setItem('userId', tokenPayload.id);
                const user = await getUserData();
                localStorage.setItem('user', JSON.stringify(user));


                window.location.href = '/home';
            } catch (error: any) {
                setFormSubmitted(false);
                
                if (error.message.includes('duplicate key error')) {
                    if (error.message.includes('email_1')) {
                        setApiError('Este email já está cadastrado em nossa base de dados'); 
                    } else if (error.message.includes('cpf_1')) {
                        setApiError('Este CPF já está cadastrado em nossa base de dados');
                    } else {
                        setApiError('Este registro já existe em nossa base de dados');
                    }
                } else {
                    setApiError('Ocorreu um erro ao realizar o cadastro. Por favor, tente novamente.');
                }
                
                console.error('Erro no cadastro:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const formatCPF = (value: string): string => {
        const cpf = value.replace(/\D/g, '');
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        if (field === 'cpf') {
            const numbersOnly = value.replace(/\D/g, '');
            if (numbersOnly.length <= 11) {
                value = formatCPF(numbersOnly);
            } else {
                return;
            }
        }

        setFormData(prev => ({ ...prev, [field]: value }));
        
        if (touched[field]) {
            const valueToValidate = field === 'cpf' ? value.replace(/\D/g, '') : value;
            const validationError = field === 'confirmPassword' 
                ? validators[field](value, formData.password)
                : validators[field](valueToValidate);
            setErrors(prev => ({ ...prev, [field]: validationError }));
        }
    };

    const handleBlur = (field: keyof FormData) => () => {
        setTouched(prev => ({ ...prev, [field]: true }));
        
        let valueToValidate = formData[field];
        if (field === 'cpf') {
            valueToValidate = formData[field].replace(/\D/g, '');
        }
        
        const validationError = field === 'confirmPassword'
            ? validators[field](formData[field], formData.password)
            : validators[field](valueToValidate);
        
        setErrors(prev => ({ ...prev, [field]: validationError }));
    };

    const handlePassword = () => {
        setIsShowPassword(!isShowPassword);
    };

    const handleConfirmPassword = () => {
        setIsShowConfirm(!isShowConfirm);
    };

    useEffect(() => {
        if (touched.confirmPassword) {
            const validationError = validators.confirmPassword(formData.confirmPassword, formData.password);
            setErrors(prev => ({ ...prev, confirmPassword: validationError }));
        }
    }, [formData.password, touched.confirmPassword]);


    return (
        <IonContent scrollY={true} scrollEvents={true} forceOverscroll={true}>
        <div className="register-container" >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="register-card"
            >
                <div className="register-image-container">
                    {/* Imagem de background via CSS */}
                </div>
                
                <div className="register-form-section">
                    <div className="register-header">
                        <h1 className="register-title">
                            <img src="../public/recycle.png" alt="" className="logo"/> EcoPoints
                        </h1>
                        <p className="register-subtitle">Crie sua conta e comece a contribuir</p>
                    </div>

                    {apiError && <div className="error-message">{apiError}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}
                    {navigationError && <div className="error-message">{navigationError}</div>}
            
                    <motion.form 
                        className="register-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        onSubmit={handleSubmit}
                    >
                        <Input 
                            label="Email" 
                            type="email" 
                            value={formData.email}
                            onChange={handleChange('email')}
                            onBlur={handleBlur('email')}
                            error={errors.email}
                            placeholder="Digite seu email"
                            disabled={isLoading}
                        />

                        <Input 
                            label="CPF" 
                            type="text" 
                            value={formData.cpf}
                            onChange={handleChange('cpf')}
                            onBlur={handleBlur('cpf')}
                            error={errors.cpf}
                            placeholder="Digite o seu CPF"
                            disabled={isLoading}
                        />  

                        <Input
                            label="Username" 
                            type="text" 
                            value={formData.username}
                            onChange={handleChange('username')}
                            onBlur={handleBlur('username')}
                            error={errors.username}
                            placeholder="Digite o seu nome de usuário"
                            disabled={isLoading}
                        />
                        
                        <div className="password-container">
                            <Input 
                                label="Senha" 
                                type={isShowPassword ? "text" : "password"} 
                                value={formData.password}
                                onChange={handleChange('password')}
                                onBlur={handleBlur('password')}
                                error={errors.password}
                                placeholder="Digite sua senha"
                                disabled={isLoading}
                            />
                            <button type="button" className="show-password-button" onClick={handlePassword}>
                                {isShowPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                            </button>
                        </div>

                        <div className="password-container">
                            <Input 
                                label="Confirmar senha" 
                                type={isShowConfirm ? "text" : "password"} 
                                value={formData.confirmPassword}
                                onChange={handleChange('confirmPassword')}
                                onBlur={handleBlur('confirmPassword')}
                                error={errors.confirmPassword}
                                placeholder="Confirme sua senha"
                                disabled={isLoading}
                            />
                            <button type="button" className="show-password-button" onClick={handleConfirmPassword}>
                                {isShowConfirm ? <EyeOff size={20}/> : <Eye size={20}/>}
                            </button>
                        </div>
                        
                        <div className="password-requirements">
                            <span>A senha deve conter no mínimo:</span>
                            <ul>
                                <li>8 caracteres</li>
                                <li>Uma letra maiúscula</li>
                                <li>Uma letra minúscula</li>
                                <li>Um símbolo (!@#$%^&*)</li>
                                <li>Um número</li>
                            </ul>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="register-button" 
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processando...' : 'Cadastrar'}
                            </button>
                            
                            <div className="login-link">
                                Já tem uma conta? <a href="/login">Faça login aqui</a>
                            </div>
                        </div>
                    </motion.form>
                </div>
            </motion.div>
        </div>
        </IonContent>
    );
};

export default Register;