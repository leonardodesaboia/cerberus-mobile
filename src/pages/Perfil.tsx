import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonLabel, IonAvatar } from '@ionic/react';
import { close } from 'ionicons/icons';
import { useState, useEffect, ChangeEvent } from 'react';
import Input from '../components/Input';
import Toolbar from '../components/Toolbar';
import '../styles/Config.css';

interface FormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface TouchedFields {
    username: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
}

type ValidatorFunction = (value: string, compareValue?: string) => string;

interface Validators {
    username: ValidatorFunction;
    email: ValidatorFunction;
    password: ValidatorFunction;
    confirmPassword: ValidatorFunction;
}

const Profile: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<FormErrors>({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [touched, setTouched] = useState<TouchedFields>({
        username: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    const validators: Validators = {
        username: (value: string): string => {
            if (!value) return 'Username é obrigatório';
            if (value.length < 3) return 'Username deve ter no mínimo 3 caracteres';
            if (value.length > 20) return 'Username deve ter no máximo 20 caracteres';
            if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username deve conter apenas letras, números e _';
            return '';
        },

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
        
            return '';
        },

        confirmPassword: (value: string, password?: string): string => {
            if (!value) return 'Confirmação de senha é obrigatória';
            if (value !== password) return 'As senhas não coincidem';
            return '';
        }
    };

    const handleChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        
        if (touched[field]) {
            const validationError = field === 'confirmPassword' 
                ? validators[field](value, formData.password)
                : validators[field](value);
            setErrors(prev => ({ ...prev, [field]: validationError }));
        }
    };

    const handleBlur = (field: keyof FormData) => () => {
        setTouched(prev => ({ ...prev, [field]: true }));
        
        const validationError = field === 'confirmPassword'
            ? validators[field](formData[field], formData.password)
            : validators[field](formData[field]);
        
        setErrors(prev => ({ ...prev, [field]: validationError }));
    };

    useEffect(() => {
        if (touched.confirmPassword) {
            const validationError = validators.confirmPassword(formData.confirmPassword, formData.password);
            setErrors(prev => ({ ...prev, confirmPassword: validationError }));
        }
    }, [formData.password, touched.confirmPassword, formData.confirmPassword]);

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonTitle className="profile-title">LEONARDO DE SABOIA</IonTitle>
                    <IonButtons slot="end">
                        <IonButton>
                            <IonIcon icon={close} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="profile-content">
                <div className="avatar-container">
                    <IonAvatar className="profile-avatar">
                        <img src="/avatar-placeholder.png" alt="Profile" />
                    </IonAvatar>
                </div>

                <div className="profile-form">
                    <div className="info-section">
                        <IonLabel className="section-label">Username</IonLabel>
                        <Input 
                            label="Username" 
                            type="text" 
                            value={formData.username}
                            onChange={handleChange('username')}
                            onBlur={handleBlur('username')}
                            error={errors.username}
                            placeholder="Digite seu username"
                        />
                    </div>

                    <div className="info-section">
                        <IonLabel className="section-label">Email</IonLabel>
                        <Input 
                            label="Email" 
                            type="email" 
                            value={formData.email}
                            onChange={handleChange('email')}
                            onBlur={handleBlur('email')}
                            error={errors.email}
                            placeholder="Digite seu email"
                        />
                    </div>

                    <div className="info-section">
                        <IonLabel className="section-label">Senha</IonLabel>
                        <Input 
                            label="Senha" 
                            type="password" 
                            value={formData.password}
                            onChange={handleChange('password')}
                            onBlur={handleBlur('password')}
                            error={errors.password}
                            placeholder="Digite sua senha"
                        />
                    </div>

                    <div className="info-section">
                        <IonLabel className="section-label">Confirmar Senha</IonLabel>
                        <Input 
                            label="Confirmar senha" 
                            type="password" 
                            value={formData.confirmPassword}
                            onChange={handleChange('confirmPassword')}
                            onBlur={handleBlur('confirmPassword')}
                            error={errors.confirmPassword}
                            placeholder="Confirme sua senha"
                        />
                    </div>
                </div>

                <div className="delete-account">
                    <IonButton 
                        fill="clear" 
                        className="delete-button"
                        color="danger"
                    >
                        Deletar conta
                    </IonButton>
                </div>
            </IonContent>
            
            <Toolbar />
        </IonPage>
    );
};

export default Profile;