import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/ForgotPassword.css';
import { Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/api'; // Import the API function
import { IonToast } from '@ionic/react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    setApiError('');
    setSuccessMessage('');
  }, [email]);

  const validateEmail = (email: string): string => {
    if (!email) return 'Email é obrigatório';
    
    email = email.trim();
    
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) return 'Email deve conter exatamente um @';
    
    const [localPart, domain] = email.split('@');
    
    if (!localPart || localPart.length < 3) return 'Parte local do email deve ter pelo menos 3 caracteres';
    if (localPart.length > 64) return 'Parte local do email é muito longa (máx. 64 caracteres)';
    
    if (!domain) return 'Domínio do email não pode estar vazio';
    if (domain.length > 255) return 'Domínio do email é muito longo';
    if (!domain.includes('.')) return 'Domínio deve conter pelo menos um ponto';
    
    // Verificar parte local
    const localPartRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/;
    if (!localPartRegex.test(localPart)) {
        return 'Email deve começar e terminar com letra ou número';
    }
    
    // Verificar formato do domínio
    const domainRegex = /^[a-zA-Z0-9][-a-zA-Z0-9.]*[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain)) {
        return 'Formato de domínio inválido';
    }
    
    // Verificar caracteres especiais em sequência
    if (email.includes('..') || email.includes('--') || email.includes('__')) {
        return 'Email não pode conter sequências de caracteres especiais';
    }
    
    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const emailValidationError = validateEmail(email);
    setEmailError(emailValidationError);
    
    if (emailValidationError) {
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    setSuccessMessage('');
    
    try {
      const response = await requestPasswordReset(email);
      setSuccessMessage(response.message);
      setEmail('');
      setShowToast(true);
      setToastMessage(`Email enviado com sucesso!`);
    } catch (err: any) {
      setApiError('Verifique se o email está digitado corretamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="forgot-password-card"
      >
        <div className="forgot-password-image-container">
          {/* Imagem ilustrativa pode ser adicionada aqui */}
        </div>
        
        <div className="forgot-password-form-section">
          <div className="forgot-password-header">
            <Link to="/login" className="back-link">
              <ArrowLeft size={20} />
              <span>Voltar</span>
            </Link>
            <h1 className="forgot-password-title">
              <img src="../public/recycle.png" alt="" className="logo"/> EcoPoints
            </h1>
            <p className="forgot-password-subtitle">Esqueceu sua senha?</p>
            <p className="forgot-password-description">
              Digite seu e-mail abaixo e enviaremos instruções para redefinir sua senha.
            </p>
          </div>

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
      
          <motion.form 
            className="forgot-password-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
          >
            <div className="input-container">
              <label htmlFor="email">Email</label>
              <div className="email-input-wrapper">
                <Mail size={20} className="email-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email cadastrado"
                  disabled={isLoading}
                  className={emailError ? "input-error" : ""}
                />
              </div>
              {emailError && <div className="error-text">{emailError}</div>}
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="forgot-password-button" 
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar instruções'}
              </button>
              
              <div className="login-signup-links">
                <div className="login-link">
                  Lembrou a senha? <Link to="/login">Faça login aqui</Link>
                </div>
                <div className="signup-link">
                  Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link>
                </div>
              </div>
            </div>
          </motion.form>
        </div>
      </motion.div>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="top"
        color={toastMessage.includes('sucesso') ? 'success' : 'danger'}
      />
    </div>
  );
};

export default ForgotPassword;