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
    }, [shouldRefresh]);

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
        <IonHeader className="store-header" collapse="condense" style={{ padding: "0 !important"}}>
            <IonToolbar className="custom-toolbar" style={{ padding: "0 !important"}}>
                <IonTitle size="large" className="custom-title">
                    Bem vindo(a) {username}!
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