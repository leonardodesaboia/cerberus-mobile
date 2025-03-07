import { IonHeader, IonToolbar, IonTitle, IonLabel, IonText, IonIcon, IonButton, IonRow, IonCol, IonGrid } from "@ionic/react";
import { useEffect, useState } from "react";
import { getUserData } from "../services/api";
import PointsUpdateEvent from "../utils/pointsUpdateEvent";
import { chevronForward } from 'ionicons/icons';
import '../styles/Header.css'; // Import the CSS file

const Header: React.FC = () => {
    console.log("Header component rendering");
    const [username, setUsername] = useState<string>("Usuário");
    const [currentPoints, setCurrentPoints] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            
            if (!token || !userId) {
                console.warn("Missing token or userId in localStorage");
                setUsername("Visitante");
                setCurrentPoints(0);
                setLoading(false);
                return;
            }
            
            console.log("Fetching user data...");
            const userData = await getUserData();
            console.log("User data received:", userData);
            
            setUsername(userData.username || "Usuário");
            setCurrentPoints(userData.points || 0);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Erro ao carregar dados");
            setUsername("Usuário");
            setCurrentPoints(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("Header component mounted");
        fetchUserData();
        
        PointsUpdateEvent.subscribe(fetchUserData);

        return () => {
            console.log("Header component unmounting");
            PointsUpdateEvent.unsubscribe(fetchUserData);
        };
    }, []);

    const windowChange = () => {
        window.location.href = "/statement";
    }

    return (
        <IonHeader className="ion-no-border app-header">
            <IonToolbar mode="md" className="app-header">
                <div className="header-content">
                    <IonTitle size="large" className="welcome-title">
                        Bem vindo(a) {loading ? <span className="loading-dots">...</span> : username}
                    </IonTitle>
                    
                    <div className="points-container">
                        <IonLabel className="points-label">
                            Seu saldo de pontos
                        </IonLabel>
                        
                        <IonButton 
                            fill="clear" 
                            onClick={windowChange}
                            className="points-button"
                        >
                            <IonText>
                                <h3 className="points-value">
                                    {loading ? <span className="loading-dots">...</span> : currentPoints}
                                    <IonIcon icon={chevronForward} className="points-icon" />
                                </h3>
                            </IonText>
                        </IonButton>
                    </div>
                </div>
            </IonToolbar>
        </IonHeader>
    );
};

export default Header;