
import React, { useState, useCallback } from 'react';
import { FormData } from './types';
import { generateAmbassadorStory } from './services/geminiService';

// --- UI Components (Defined outside App to prevent re-creation on re-renders) ---

const PixelatedCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_#000000] ${className}`}>
    {children}
  </div>
);

interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}

const TextInput: React.FC<InputProps> = ({ label, name, ...props }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-black text-sm mb-2">{label}</label>
    <input
      id={name}
      name={name}
      className="w-full bg-white border-2 border-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD837]"
      {...props}
    />
  </div>
);

const TextareaInput: React.FC<InputProps> = ({ label, name, ...props }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-black text-sm mb-2">{label}</label>
    <textarea
      id={name}
      name={name}
      rows={4}
      className="w-full bg-white border-2 border-black p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD837]"
      {...props}
    />
  </div>
);


interface ButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children: React.ReactNode;
}

const PixelatedButton: React.FC<ButtonProps> = ({ onClick, type = 'button', disabled = false, children }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-center p-3 border-4 border-black text-black text-sm
      ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FFD837] hover:bg-yellow-400 active:translate-y-1 active:translate-x-1 active:shadow-none'}
      shadow-[4px_4px_0px_#000000] transition-all duration-150 ease-in-out`}
  >
    {children}
  </button>
);

const LoadingIcon = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin w-16 h-16 border-4 border-black border-t-transparent"></div>
    <span className="ml-4 text-lg">Gerando sua história...</span>
  </div>
);


// --- Main App Component ---

const App: React.FC = () => {
  const [view, setView] = useState<'form' | 'result'>('form');
  const [formData, setFormData] = useState<FormData>({
    habboName: '',
    motto: '',
    yearsPlayed: '',
    reason: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const isFormValid = formData.habboName && formData.yearsPlayed && formData.reason;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setView('result');
    setIsLoading(true);
    setError(null);
    setGeneratedStory(null);

    try {
      const story = await generateAmbassadorStory(formData);
      setGeneratedStory(story);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, isFormValid]);

  const handleReset = () => {
    setView('form');
    setFormData({
      habboName: '',
      motto: '',
      yearsPlayed: '',
      reason: '',
    });
    setGeneratedStory(null);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-cover bg-center" style={{backgroundImage: "url('https://images.habbo.com/c_images/reception/reception_background_widescreen.png')"}}>
      <main className="w-full max-w-2xl mx-auto">
        {view === 'form' ? (
          <PixelatedCard>
            <h1 className="text-2xl md:text-3xl text-center mb-2">Formulário de Embaixador</h1>
            <p className="text-center text-xs mb-8 text-gray-600">Preencha para se tornar uma lenda do Habbo!</p>
            <form onSubmit={handleSubmit}>
              <TextInput label="Nome do Habbo" name="habboName" value={formData.habboName} onChange={handleInputChange} placeholder="Seu nick no jogo" required />
              <TextInput label="Sua Missão" name="motto" value={formData.motto} onChange={handleInputChange} placeholder="Seu lema no Habbo (opcional)" />
              <TextInput label="Anos de Jogo" name="yearsPlayed" type="number" value={formData.yearsPlayed} onChange={handleInputChange} placeholder="Ex: 5" required />
              <TextareaInput label="Por que você?" name="reason" value={formData.reason} onChange={handleInputChange} placeholder="Conte-nos por que você seria um ótimo Embaixador." required />
              <PixelatedButton type="submit" disabled={!isFormValid}>
                Enviar e Gerar História!
              </PixelatedButton>
            </form>
          </PixelatedCard>
        ) : (
          <PixelatedCard>
            <h1 className="text-2xl md:text-3xl text-center mb-6">Sua Saga de Embaixador!</h1>
            {isLoading && <LoadingIcon />}
            {error && (
              <div className="text-center text-red-600 bg-red-100 border-2 border-red-600 p-4">
                <p className="font-bold mb-2">Oops! Algo deu errado.</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            {generatedStory && (
              <div className="bg-blue-100 border-2 border-black p-4 max-h-80 overflow-y-auto">
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{generatedStory}</p>
              </div>
            )}
            <div className="mt-8">
              <PixelatedButton onClick={handleReset}>
                Voltar ao Formulário
              </PixelatedButton>
            </div>
          </PixelatedCard>
        )}
      </main>
      <footer className="text-center mt-8 text-white text-xs" style={{textShadow: '2px 2px #000'}}>
        <p>Criado para a comunidade Habbo. Não afiliado à Sulake Corporation Oy.</p>
      </footer>
    </div>
  );
};

export default App;
