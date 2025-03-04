import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonLabel, IonIcon, IonToast, IonAlert } from '@ionic/react';
import { useState, useEffect, ChangeEvent } from 'react';
import Input from '../components/Input';
import Toolbar from '../components/Toolbar';
import '../styles/EditProfile.css';
import { getUserData, editUserData } from '../services/api';

const EditProfile: React.FC = () => {
    const [userName, setUserName] = useState('');
    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [originalEmail, setOriginalEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');


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
            }
        };
        loadUserData();
    }, []);

    //salvar mudanças no db
    const handleSaveChanges = async () => {
        const updates: { username?: string; email?: string } = {};
        if (userName.trim()) updates.username = userName;
        if (newEmail.trim() && newEmail !== originalEmail) updates.email = newEmail;
        
        if (Object.keys(updates).length === 0) return;
        
        try {
            const updatedUser = await editUserData(updates);
            setUserName(updatedUser.username);
            setCurrentEmail(updatedUser.email);
            setOriginalEmail(updatedUser.email);
            setNewEmail('');
            setToastMessage(`Usuário editado com sucesso!`);
            setShowToast(true);
        } catch (error) {
            console.error('Erro ao salvar alterações:', error);
        }
    };

    //deletar usuario erro!!
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
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } catch (error) {
          console.error(error);
        }
      };

      const windowChange = () => {      
        window.location.href = '/edit-profile';
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
                        <Input type="text" placeholder="Usuário" value={userName} onChange={(e) => setUserName(e.target.value)} className='input-field' />
                    </div>

                    <div className="info-section">
                        <IonLabel className="section-label">E-mail atual</IonLabel>
                        <Input type="email" value={currentEmail} disabled className='input-field' />
                    </div>

                    <div className="info-section">
                        <IonLabel className="section-label">Novo E-mail</IonLabel>
                        <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className='input-field' />
                    </div>
                    {/* bor=toes salvar,sair e deletar */}
                    <div className="save">
                        <IonButton fill="clear" className="save-button" onClick={handleSaveChanges}>Salvar</IonButton>
                    </div>
                    {/* <div className="logout">
                    <IonButton fill="clear" className="logout-button" onClick={handleLogout}>Sair</IonButton>
                </div> */}

                <div className="delete-account">
                    <IonButton fill='clear' className="delete-button" id="present-alert" color="danger">Deletar conta</IonButton>
                        <IonAlert
                            header="Tem certeza que deseja excluir sua conta?"
                            trigger="present-alert"
                            subHeader='Essa ação não pode ser desfeita'
                            buttons={[
                            {
                                text: 'Cancelar',
                                role: 'cancel',
                                handler: () => {
                                console.log('Alert canceled');
                                },
                            },
                            {
                                text: 'Excluir permanente',
                                role: 'confirm',
                                handler: () => {
                                deleteUser();
                                },
                            },
                            ]}
                            onDidDismiss={({ detail }) => console.log(`Dismissed with role: ${detail.role}`)}
                        ></IonAlert>
                    
                </div>
                </div>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="top"
                    color={toastMessage.includes('sucesso') ? 'success' : 'danger'}
                />
            </IonContent>
            <Toolbar />
        </IonPage>
    );
};

export default EditProfile;