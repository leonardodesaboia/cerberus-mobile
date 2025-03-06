import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonLabel, IonIcon, IonToast, IonAlert } from '@ionic/react';
import { useState, useEffect, ChangeEvent } from 'react';
import Input from '../components/Input';
import Toolbar from '../components/Toolbar';
import '../styles/EditProfile.css';
import { getUserData, editUserData } from '../services/api';

interface FormErrors {
    username: string;
    email: string;
}

interface TouchedFields {
    username: boolean;
    email: boolean;
}

const EditProfile: React.FC = () => {
    const [userName, setUserName] = useState('');
    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [originalEmail, setOriginalEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState<boolean>(true);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    
    // Adicionar estados para os erros e campos tocados
    const [errors, setErrors] = useState<FormErrors>({
        username: '',
        email: ''
    });
    
    const [touched, setTouched] = useState<TouchedFields>({
        username: false,
        email: false
    });

    // Funções de validação
    const validators = {
        email: (value: string): string => {
            if (!value) return '';
            
            value = value.trim();
            
            const atCount = (value.match(/@/g) || []).length;
            if (atCount !== 1) return 'Formato de email inválido: deve conter exatamente um @';
            
            const [localPart, domain] = value.split('@');
            
            if (!localPart || localPart.length < 3) return 'A parte local do email deve ter pelo menos 3 caracteres';
            if (localPart.length > 64) return 'A parte local do email é muito longa (máx. 64 caracteres)';
            
            const localPartRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/;
            if (!localPartRegex.test(localPart)) {
                return 'Email deve possuir apenas letras ou números no nome e domínio';
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
        
        username: (value: string): string => {
            if (!value) return '';
            if (value.length < 3) return 'Username deve ter no mínimo 3 caracteres';
            if (value.length > 20) return 'Username deve ter no máximo 20 caracteres';
            if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username deve conter apenas letras, números e _ (underline)';
            return '';
        }
    };

    //carregar dados do usuario
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userData = await getUserData();
                setUserName(userData.username || '');
                setCurrentEmail(userData.email || '');
                setOriginalEmail(userData.email || '');
                setUserId(userData._id || '');
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                setToastMessage('Erro ao carregar dados do usuário');
                setIsSuccess(false);
                setShowToast(true);
            }
        };
        loadUserData();
    }, []);

    // Handlers para mudanças nos campos
    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUserName(value);
        
        if (touched.username) {
            const validationError = validators.username(value);
            setErrors(prev => ({ ...prev, username: validationError }));
        }
    };
    
    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewEmail(value);
        
        if (touched.email) {
            const validationError = validators.email(value);
            setErrors(prev => ({ ...prev, email: validationError }));
        }
    };
    
    // Handlers para blur (quando o usuário sai do campo)
    const handleUsernameBlur = () => {
        setTouched(prev => ({ ...prev, username: true }));
        const validationError = validators.username(userName);
        setErrors(prev => ({ ...prev, username: validationError }));
    };
    
    const handleEmailBlur = () => {
        setTouched(prev => ({ ...prev, email: true }));
        const validationError = validators.email(newEmail);
        setErrors(prev => ({ ...prev, email: validationError }));
    };

    //salvar mudanças no db
    const handleSaveChanges = async () => {
        // Validar todos os campos antes de salvar
        const usernameError = validators.username(userName);
        const emailError = newEmail.trim() ? validators.email(newEmail) : '';
        
        // Atualizar erros e marcar campos como tocados
        setErrors({
            username: usernameError,
            email: emailError
        });
        
        setTouched({
            username: true,
            email: newEmail.trim() !== ''
        });
        
        // Se houver erros, não continuar
        if (usernameError || emailError) {
            setToastMessage('Corrija os erros antes de salvar');
            setIsSuccess(false);
            setShowToast(true);
            return;
        }
        
        // Se não houver mudanças, não fazer a requisição
        const updates: { username?: string; email?: string } = {};
        if (userName.trim() && userName !== originalEmail) updates.username = userName;
        if (newEmail.trim() && newEmail !== originalEmail) updates.email = newEmail;
        
        if (Object.keys(updates).length === 0) {
            setToastMessage('Nenhuma alteração para salvar');
            setIsSuccess(true);
            setShowToast(true);
            return;
        }
        
        try {
            const updatedUser = await editUserData(updates);
            setUserName(updatedUser.username);
            setCurrentEmail(updatedUser.email);
            setOriginalEmail(updatedUser.email);
            setNewEmail('');
            setToastMessage('Usuário editado com sucesso!');
            setIsSuccess(true);
            setShowToast(true);
            setTimeout(() => {
                window.location.href = '/profile';
              }, 1000);

            
            // Resetar os estados de erro e campos tocados
            setErrors({
                username: '',
                email: ''
            });
            
            setTouched({
                username: false,
                email: false
            });
        } catch (error: any) {
            console.error('Erro ao salvar alterações:', error);
            
            // Tratamento específico para erros comuns
            if (error?.response?.data?.message?.includes('duplicate key error')) {
                if (error.response.data.message.includes('email')) {
                    setToastMessage('Este email já está cadastrado');
                } else if (error.response.data.message.includes('username')) {
                    setToastMessage('Este nome de usuário já está em uso');
                } else {
                    setToastMessage('Este registro já existe em nossa base de dados');
                }
            } else {
                setToastMessage('Erro ao salvar alterações. Tente novamente.');
            }
            
            setIsSuccess(false);
            setShowToast(true);
        }
    };

    //deletar usuario
    const deleteUser = async () => {
        const userId = localStorage.getItem("userId")
        console.log(localStorage.getItem("userId"))
        if (!userId) {
          return;
        }
        try {
          const response = await fetch(`http://localhost:3000/user/${userId}`, { 
            method: "DELETE",
            headers: { 'Content-Type': 'application/json',
              'Authorization': `${localStorage.getItem("token")}`
            },
            
          });
      
          if (!response.ok) {
            throw new Error("Erro ao excluir perfil");
          }
          
          setToastMessage('Conta excluída com sucesso!');
          setIsSuccess(true);
          setShowToast(true);
          
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } catch (error) {
          console.error(error);
          setToastMessage('Erro ao excluir conta. Tente novamente.');
          setIsSuccess(false);
          setShowToast(true);
        }
    };

    const windowChange = () => {      
        window.location.href = '/profile';
    };

    return (
        <IonPage>
            <header className="header">
                <div className="toolbar-edit-profile">
                    <div className="back-button" onClick={windowChange}>
                    <span className="back-icon" style={{ fontSize: '24px', color: 'white' }}>&#8592;</span>
                    </div>
                    <h1 className="edit-profile-title">Editar cadastro</h1>
                </div>
            </header>

            <IonContent className="edit-profile-content">
                
                {/* editar usuario e email, sair e deletar conta */}
                <div className="edit-profile-form">
                    <div className="info-section">
                        <IonLabel className="section-label">Usuário</IonLabel>
                        <Input 
                            type="text" 
                            placeholder="Usuário" 
                            value={userName} 
                            onChange={handleUsernameChange}
                            onBlur={handleUsernameBlur}
                            error={errors.username}
                            className='input-field' 
                        />
                    </div>

                    <div className="info-section">
                        <IonLabel className="section-label">E-mail atual</IonLabel>
                        <Input type="email" value={currentEmail} disabled className='input-field' />
                    </div>

                    <div className="info-section">
                        <IonLabel className="section-label">Novo E-mail</IonLabel>
                        <Input 
                            type="email" 
                            value={newEmail} 
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
                            error={errors.email}
                            className='input-field' 
                        />
                    </div>
                    
                    <div className="save">
                        <IonButton fill="clear" className="save-button" onClick={handleSaveChanges}>Salvar</IonButton>
                    </div>

                    <div className="delete-account">
                        <IonButton 
                            fill='clear' 
                            className="delete-button" 
                            color="danger"
                            onClick={() => setShowDeleteAlert(true)}
                        >
                            Deletar conta
                        </IonButton>
                        
                        <IonAlert
                            isOpen={showDeleteAlert}
                            onDidDismiss={() => setShowDeleteAlert(false)}
                            header="Tem certeza que deseja excluir sua conta?"
                            subHeader='Essa ação não pode ser desfeita'
                            buttons={[
                                {
                                    text: 'Cancelar',
                                    role: 'cancel',
                                    handler: () => {
                                        console.log('Alert canceled');
                                        setShowDeleteAlert(false);
                                    },
                                },
                                {
                                    text: 'Excluir permanente',
                                    role: 'confirm',
                                    handler: () => {
                                        deleteUser();
                                        setShowDeleteAlert(false);
                                    },
                                },
                            ]}
                        />
                    </div>
                </div>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="top"
                    color={isSuccess ? 'success' : 'danger'}
                />
            </IonContent>
            <Toolbar />
        </IonPage>
    );
};

export default EditProfile;