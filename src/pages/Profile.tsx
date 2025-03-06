import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonLabel, IonIcon, IonAlert } from '@ionic/react';
import { useState, useEffect, ChangeEvent } from 'react';
import Input from '../components/Input';
import Toolbar from '../components/Toolbar';
import '../styles/Profile.css';
import { getUserData, editUserData } from '../services/api';

const Profile: React.FC = () => {
    const [userName, setUserName] = useState('');
    const [currentEmail, setCurrentEmail] = useState('');
    const [userId, setUserId] = useState('');

    //carregar dados do usuario
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userData = await getUserData();
                setUserName(userData.username || '');
                setCurrentEmail(userData.email || '');
                setUserId(userData._id || '');
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            }
        };
        loadUserData();
    }, []);

    //salvar mudanças no db
    const changeWindow = async () => {
        window.location.href = '/edit-profile';
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    //deletar usuario erro!!

    return (
        <IonPage>
            <header className="header">
                <div className="toolbar-profile">
                    <div className="back-button" >
                    </div>
                    <h1 className="profile-title">Meu cadastro</h1>
                </div>
            </header>

            <IonContent className="profile-content">

                
                {/* editar usuario e email, sair e deletar conta */}
                <div className="profile-form">
                    <div className="info-section">
                        <IonLabel className="section-label">Usuário</IonLabel>
                        <h2 className='input-field' >{userName} </h2>
                    </div>

                    <div className="info-section">
                        <IonLabel className="section-label">E-mail</IonLabel>
                        <h2 className='input-field' >{currentEmail}</h2>
                    </div>

                    {/* bor=toes salvar,sair e deletar */}
                    <div className="save">
                        <IonButton fill="clear" className="save-button" routerLink='edit-profile'><IonIcon icon="create-outline" />Editar informações</IonButton>
                        
                    </div>
                    <div className="logout">
                    <IonButton fill='clear' className="logout-button" id="present-alert" style={{ color: 'red' }}>Sair</IonButton>
                        <IonAlert
                            header="Tem certeza que deseja sair?"
                            trigger="present-alert"
                            buttons={[
                            {
                                text: 'Cancelar',
                                role: 'cancel',
                                handler: () => {
                                console.log('Alert canceled');
                                },
                            },
                            {
                                text: 'Sair',
                                role: 'confirm',
                                handler: () => {
                                handleLogout();
                                },
                            },
                            ]}
                            onDidDismiss={({ detail }) => console.log(`Dismissed with role: ${detail.role}`)}
                        ></IonAlert>
                </div>
                </div>
            </IonContent>
            
            <Toolbar />
        </IonPage>
    );
};

export default Profile;