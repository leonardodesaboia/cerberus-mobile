import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { registerUser } from '../services/api';
import Input from '../components/Input';
import '../styles/Register.css';

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

type ValidatorFunction = (value: string, compareValue?: string) => string;

interface Validators {
    email: ValidatorFunction;
    cpf: ValidatorFunction;
    username: ValidatorFunction;
    password: ValidatorFunction;
    confirmPassword: ValidatorFunction;
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

    const validators: Validators = {
        email: (value: string): string => {
            if (!value) return 'Email é obrigatório';
            
            value = value.trim();
            
            const atCount = (value.match(/@/g) || []).length;
            if (atCount !== 1) return 'Email deve conter exatamente um @';
            
            const [localPart, domain] = value.split('@');
            
            if (!localPart || localPart.length < 3) return 'Parte local do email deve ter pelo menos 3 caracteres';
            if (localPart.length > 64) return 'Parte local do email não pode ter mais de 64 caracteres';
            
            const localPartRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/;
            if (!localPartRegex.test(localPart)) {
                return 'Email deve começar e terminar com letra ou número';
            }
            
            if (!domain) return 'Domínio do email não pode estar vazio';
            if (domain.length > 255) return 'Domínio do email não pode ter mais de 255 caracteres';
            if (!domain.includes('.')) return 'Domínio deve conter pelo menos um ponto';
            
            const domainRegex = /^[a-zA-Z][-a-zA-Z.]*[a-zA-Z](\.[a-zA-Z]{2,})+$/;
            if (!domainRegex.test(domain)) {
                return 'Domínio deve conter apenas letras, pontos e hífens';
            }
            
            if (value.includes('..') || value.includes('--') || value.includes('__')) {
                return 'Email não pode conter sequências de caracteres especiais';
            }
            
            if (/^[._-]|[._-]$/.test(localPart)) {
                return 'Email não pode começar ou terminar com caracteres especiais';
            }
            
            const suspiciousPatterns = [/[^a-zA-Z0-9]{3,}/];
            
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(value)) {
                    return 'Formato de email inválido';
                }
            }
            
            return '';
        },

        cpf: (value: string): string => {
            const cpfClean = value.replace(/\D/g, '');
            
            if (!cpfClean) return 'CPF é obrigatório';
            if (cpfClean.length !== 11) return 'CPF deve conter 11 dígitos';
            
            if (/^(\d)\1{10}$/.test(cpfClean)) return 'CPF inválido';
            
            let sum = 0;
            let remainder: number;
            
            for (let i = 1; i <= 9; i++) {
                sum = sum + parseInt(cpfClean.substring(i - 1, i)) * (11 - i);
            }
            
            remainder = (sum * 10) % 11;
            if (remainder === 10 || remainder === 11) remainder = 0;
            if (remainder !== parseInt(cpfClean.substring(9, 10))) return 'CPF inválido';
            
            sum = 0;
            for (let i = 1; i <= 10; i++) {
                sum = sum + parseInt(cpfClean.substring(i - 1, i)) * (12 - i);
            }
            
            remainder = (sum * 10) % 11;
            if (remainder === 10 || remainder === 11) remainder = 0;
            if (remainder !== parseInt(cpfClean.substring(10, 11))) return 'CPF inválido';
            
            return '';
        },

        username: (value: string): string => {
            if (!value) return 'Username é obrigatório';
            if (value.length < 3) return 'Username deve ter no mínimo 3 caracteres';
            if (value.length > 20) return 'Username deve ter no máximo 20 caracteres';
            if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username deve conter apenas letras, números e _';
            return '';
        },

        password: (value: string): string => {
            if (!value) return 'Senha é obrigatória';
            if (value.length < 8) return 'Senha deve ter no mínimo 8 caracteres';
            if (value.length > 32) return 'Senha deve ter no máximo 32 caracteres';
        
            const allowedCharsRegex = /^[a-zA-Z0-9!@#$%^&*]+$/;
            if (!allowedCharsRegex.test(value)) {
                return 'Senha deve conter apenas letras, números e caracteres especiais (!@#$%^&*)';
            }
        
            if (!/[A-Z]/.test(value)) return 'Senha deve conter pelo menos uma letra maiúscula';
            if (!/[a-z]/.test(value)) return 'Senha deve conter pelo menos uma letra minúscula';
            if (!/[0-9]/.test(value)) return 'Senha deve conter pelo menos um número';
            if (!/[!@#$%^&*]/.test(value)) return 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)';
        
            if (/(.)\1{2,}/.test(value)) {
                return 'Senha não pode conter três ou mais caracteres iguais em sequência';
            }
        
            if (/\s/.test(value)) {
                return 'Senha não pode conter espaços';
            }
        
            for (let i = 0; i < value.length; i++) {
                if (value.charCodeAt(i) > 127) {
                    return 'Senha não pode conter emojis ou caracteres especiais não permitidos';
                }
            }
        
            return '';
        },

        confirmPassword: (value: string, password?: string): string => {
            if (!value) return 'Confirmação de senha é obrigatória';
            if (value !== password) return 'As senhas não coincidem';
            return '';
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setApiError('');
        setSuccessMessage('');
        
        const allTouched = Object.keys(touched).reduce<TouchedFields>(
            (acc, key) => ({ ...acc, [key as keyof TouchedFields]: true }), 
            {} as TouchedFields
        );
        setTouched(allTouched);

        const newErrors: FormErrors = {
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
                console.log('Cadastro realizado com sucesso:', response);
                
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

                window.location.href = '/';
                
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

    const handleChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
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

    useEffect(() => {
        if (touched.confirmPassword) {
            const validationError = validators.confirmPassword(formData.confirmPassword, formData.password);
            setErrors(prev => ({ ...prev, confirmPassword: validationError }));
        }
    }, [formData.password, touched.confirmPassword, formData.confirmPassword]);

    return (
        <div className="register-container">
            <div className="register-header">
                <h1>Cerberus</h1>
            </div>

            <div className="form-container-register">
                {apiError && (
                    <div className="error-message">
                        {apiError}
                    </div>
                )}
                
                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}

                {navigationError && (
                    <div className="error-message">
                        {navigationError}
                    </div>
                )}

                <form className="register-form" onSubmit={handleSubmit}>
                    <Input 
                        label="Email" 
                        type="email" 
                        value={formData.email}
                        onChange={handleChange('email')}
                        onBlur={handleBlur('email')}
                        error={errors.email}
                        placeholder="Digite seu email"
                    />

                    <Input 
                        label="CPF" 
                        type="text" 
                        value={formData.cpf}
                        onChange={handleChange('cpf')}
                        onBlur={handleBlur('cpf')}
                        error={errors.cpf}
                        placeholder="Digite o seu CPF"
                    />  

                    <Input
                        label="Username" 
                        type="text" 
                        value={formData.username}
                        onChange={handleChange('username')}
                        onBlur={handleBlur('username')}
                        error={errors.username}
                        placeholder="Digite o seu nome de usuário"
                    />
                    
                    <Input 
                        label="Senha" 
                        type="password" 
                        value={formData.password}
                        onChange={handleChange('password')}
                        onBlur={handleBlur('password')}
                        error={errors.password}
                        placeholder="Digite sua senha"
                    />

                  <Input 
                      label="Confirmar senha" 
                      type="password" 
                      value={formData.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      error={errors.confirmPassword}
                      placeholder="Confirme sua senha"
                  />

                  <button type="submit" className="register-button">
                      Cadastrar
                  </button>
              </form>
          </div>

          <div className="wave-container-register">
              <img src='/Vector.png' alt='Bottom img' className='wave-register'/>
          </div>
      </div>
  );
}

export default Register;