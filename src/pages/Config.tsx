// Profile.tsx
import { 
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonInput,
  IonLabel,
  IonAvatar,
  IonItem
} from '@ionic/react';
import { useState } from 'react';
import { close } from 'ionicons/icons';
import Toolbar from '../components/Toolbar';
import '../styles/Config.css';
import Input from '../components/Input';

const Profile: React.FC = () => {
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    location: ''
  });

  const handleChange = (field: string, value: string | null | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || ''
    }));
  };

  const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState<boolean>();

  const validateEmail = (email: string) => {
    return email.match(
      /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    );
  };

  const validate = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;

    setIsValid(undefined);

    if (value === '') return;

    validateEmail(value) !== null ? setIsValid(true) : setIsValid(false);
  };

  const markTouched = () => {
    setIsTouched(true);
  };

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
            <IonLabel className="section-label">Telefone celular</IonLabel>
            <IonItem lines="none" className="input-item">
            <Input 
                        label="Email" 
                        type="email" 
                        value={formData.email}
                        placeholder="Digite seu email"
                    />
            </IonItem>
          </div>

          <div className="info-section">
            <IonLabel className="section-label">Email</IonLabel>
            <IonItem lines="none" className="input-item">
              <IonInput
                type="email"
                value={formData.email}
                placeholder="leonardodesaboia@hotmail.com"
                onIonInput={e => handleChange('email', e.detail.value)}
                className="custom-input"
              />
            </IonItem>
          </div>

          <div className="info-section">
            <IonLabel className="section-label">Senha</IonLabel>
            <IonItem lines="none" className="input-item">
              <IonInput
                type="password"
                value={formData.password}
                placeholder="••••••"
                onIonInput={e => handleChange('password', e.detail.value)}
                className="custom-input"
              />
            </IonItem>
          </div>

          <div className="info-section">
            <IonLabel className="section-label">Localização</IonLabel>
            <IonItem lines="none" className="input-item">
              <IonInput
                type="text"
                value={formData.location}
                placeholder="Ceará"
                onIonInput={e => handleChange('location', e.detail.value)}
                className="custom-input"
              />
            </IonItem>
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