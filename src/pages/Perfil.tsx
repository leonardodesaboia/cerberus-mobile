import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonLabel, IonAvatar } from '@ionic/react';
import { close } from 'ionicons/icons';
import { useState, useEffect, ChangeEvent } from 'react';
import Input from '../components/Input';
import Toolbar from '../components/Toolbar';
import '../styles/Perfil.css';

interface FormData {
    username: string;
    email: string;
    newEmail: string;
    
}

interface FormErrors {
    username: string;
    email: string;
    newEmail: string;
}

interface TouchedFields {
    username: boolean;
    email: boolean;
    newEmail: boolean;
}

type ValidatorFunction = (value: string, compareValue?: string) => string;

interface Validators {
    username: ValidatorFunction;
    email: ValidatorFunction;
    newEmail: ValidatorFunction;
}

const Profile: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        username: '',
        email: '',
        newEmail: '',
        
    });

    const [errors, setErrors] = useState<FormErrors>({
        username: '',
        email: '',
        newEmail: '',

        
    });

    const [touched, setTouched] = useState<TouchedFields>({
        username: false,
        email: false,
        newEmail: false,
        
    });

    const validators: Validators = {
        username: (value: string): string => {
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
    // qtd de carct do email
            if (!localPart || localPart.length < 3) return 'Parte local do email deve ter pelo menos 3 caracteres';
            if (localPart.length > 64) return 'Parte local do email não pode ter mais de 64 caracteres';
    //regex
            const localPartRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/;
            if (!localPartRegex.test(localPart)) {
                return 'Parte local do email deve começar e terminar com letra ou número';
            }
    //verifica se está vazio
            if (!domain) return 'Domínio do email não pode estar vazio';
            if (domain.length > 255) return 'Domínio do email não pode ter mais de 255 caracteres';
            if (!domain.includes('.')) return 'Domínio deve conter pelo menos um ponto';
    //regex
            const domainRegex = /^[a-zA-Z][-a-zA-Z.]*[a-zA-Z](\.[a-zA-Z]{2,})+$/;
            if (!domainRegex.test(domain)) {
                return 'Domínio deve conter apenas letras, pontos e hífens';
            }
    
            return '';
        },
    //novo email ( q vai ser substituido)
        newEmail: (value: string, compareValue?: string): string => {
            const emailError = validators.email(value);
            if (emailError) return `Novo email inválido: ${emailError}`;
    
            if (compareValue && value === compareValue) {
                return 'O novo email não pode ser igual ao email atual';
            }
    
            return '';
        }
    };
    

    
//pega o valor digitado no input
    const handleChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

// att o estado do formulário, mantendo os outros campos inalterados
        setFormData(prev => ({ ...prev, [field]: value }));
        
        if (touched[field]) {
            const validationError = field === 'newEmail' 
                ? validators[field](value, formData.newEmail)
                : validators[field](value);
            setErrors(prev => ({ ...prev, [field]: validationError }));
        }
    };

 


    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonTitle className="profile-title">Sofya Oliveira</IonTitle>
                    <IonButtons slot="end">
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="profile-content">


                <div className="profile-form">
                    <div className="info-section">
                        <IonLabel className="section-label">Username</IonLabel>
                        <Input 
                            type="text" 
                            value={formData.username}
                            onChange={handleChange('username')}
                            // onBlur={handleBlur('username')}
                            error={errors.username}
                            className='input-field'
                        />
                    </div>

                    <div className="info-section">
                        <IonLabel className="section-label">E-mail atual</IonLabel>
                        <Input 
                            type="email" 
                            value={formData.email}
                            onChange={handleChange('email')}
                            // onBlur={handleBlur('email')}
                            error={errors.email}
                            placeholder="Digite seu email atual"
                        />
                    </div>

                    <div className="info-section">
                        <IonLabel className="section-label">Novo E-mail</IonLabel>
                        <Input 
                            type="email" 
                            value={formData.email}
                            onChange={handleChange('newEmail')}
                            // onBlur={handleBlur('email')}
                            error={errors.email}
                        />
                    </div>

                    <div className="save">
                    <IonButton 
                        fill="clear" 
                        className="save-button"
                        color="#FFFF">Salvar</IonButton>
                    </div>
                </div>

                <div className="logout">
                    <IonButton 
                        fill="clear" 
                        className="logout-button"
                        color="#FFFF"
                    >Sair</IonButton>
                </div>

                <div className="delete-account">
                    <IonButton 
                        fill="clear" 
                        className="delete-button"
                        color="danger"
                    >Deletar conta </IonButton>
                </div>
            </IonContent>
            
            <Toolbar />
        </IonPage>
    );
};

export default Profile;