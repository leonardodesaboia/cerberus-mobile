// Header.tsx
import { IonHeader, IonToolbar, IonTitle, IonLabel, IonText } from "@ionic/react";
import { useEffect, useState } from "react";
import { getUserData } from "../services/api";

interface HeaderProps {
    points: number;
    shouldRefresh: boolean;
}

const Header: React.FC<HeaderProps> = ({ points, shouldRefresh }) => {
    const [username, setUsername] = useState<string>("");
    const [currentPoints, setCurrentPoints] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await getUserData();
                setUsername(userData.username);
                setCurrentPoints(userData.points);
            } catch (err) {
                setError("Erro ao carregar dados do usuário");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [shouldRefresh]); // Atualiza quando shouldRefresh mudar

    if (loading) {
        return (
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Carregando...</IonTitle>
                </IonToolbar>
            </IonHeader>
        );
    }

    if (error) {
        return (
            <IonHeader>
                <IonToolbar>
                    <IonTitle color="danger">{error}</IonTitle>
                </IonToolbar>
            </IonHeader>
        );
    }

    return (
        <IonHeader className="store-header" collapse="condense">
            <IonToolbar className="custom-toolbar">
                <IonTitle size="large" className="custom-title">
                    Bem vindo, {username}!
                </IonTitle>
                <div className="points-display">
                    <IonLabel>Seu saldo de pontos</IonLabel>
                    <IonText>
                        <h2>{currentPoints}</h2>
                    </IonText>
                </div>
            </IonToolbar>
        </IonHeader>
    );
};

export default Header;