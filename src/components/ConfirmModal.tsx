import { ReactNode, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'danger' | 'info' | 'success';
  loading?: boolean;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  loading = false,
}: ConfirmModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantConfig = {
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      buttonVariant: 'primary' as const,
    },
    danger: {
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      buttonVariant: 'danger' as const,
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      buttonVariant: 'primary' as const,
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      buttonVariant: 'primary' as const,
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={loading ? undefined : onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 ${config.bgColor} ${config.borderColor} border rounded-full p-3`}>
                <Icon size={24} className={config.iconColor} />
              </div>

              <div className="flex-1 pt-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {title}
                </h3>
                <div className="text-sm text-gray-600">
                  {message}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                variant={config.buttonVariant}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? 'Processando...' : confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
