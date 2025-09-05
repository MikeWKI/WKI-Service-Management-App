import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface LoadingState {
  global: boolean;
  operations: Map<string, boolean>;
  progress: Map<string, number>;
}

interface LoadingAction {
  type: 'START_LOADING' | 'STOP_LOADING' | 'SET_PROGRESS' | 'RESET_ALL';
  payload?: {
    operation?: string;
    progress?: number;
  };
}

const initialState: LoadingState = {
  global: false,
  operations: new Map(),
  progress: new Map()
};

function loadingReducer(state: LoadingState, action: LoadingAction): LoadingState {
  switch (action.type) {
    case 'START_LOADING':
      const newOperations = new Map(state.operations);
      if (action.payload?.operation) {
        newOperations.set(action.payload.operation, true);
      }
      return {
        ...state,
        global: action.payload?.operation ? state.global : true,
        operations: newOperations
      };

    case 'STOP_LOADING':
      const updatedOperations = new Map(state.operations);
      const updatedProgress = new Map(state.progress);
      
      if (action.payload?.operation) {
        updatedOperations.delete(action.payload.operation);
        updatedProgress.delete(action.payload.operation);
      }
      
      return {
        ...state,
        global: action.payload?.operation ? state.global : false,
        operations: updatedOperations,
        progress: updatedProgress
      };

    case 'SET_PROGRESS':
      if (!action.payload?.operation) return state;
      
      const progressMap = new Map(state.progress);
      progressMap.set(action.payload.operation, action.payload.progress || 0);
      
      return {
        ...state,
        progress: progressMap
      };

    case 'RESET_ALL':
      return initialState;

    default:
      return state;
  }
}

const LoadingContext = createContext<{
  state: LoadingState;
  startLoading: (operation?: string) => void;
  stopLoading: (operation?: string) => void;
  setProgress: (operation: string, progress: number) => void;
  isLoading: (operation?: string) => boolean;
  getProgress: (operation: string) => number;
  resetAll: () => void;
} | null>(null);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(loadingReducer, initialState);

  const startLoading = (operation?: string) => {
    dispatch({ type: 'START_LOADING', payload: { operation } });
  };

  const stopLoading = (operation?: string) => {
    dispatch({ type: 'STOP_LOADING', payload: { operation } });
  };

  const setProgress = (operation: string, progress: number) => {
    dispatch({ type: 'SET_PROGRESS', payload: { operation, progress } });
  };

  const isLoading = (operation?: string) => {
    if (!operation) return state.global || state.operations.size > 0;
    return state.operations.get(operation) || false;
  };

  const getProgress = (operation: string) => {
    return state.progress.get(operation) || 0;
  };

  const resetAll = () => {
    dispatch({ type: 'RESET_ALL' });
  };

  return (
    <LoadingContext.Provider value={{
      state,
      startLoading,
      stopLoading,
      setProgress,
      isLoading,
      getProgress,
      resetAll
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

// Global Loading Bar Component
export const GlobalLoadingBar: React.FC = () => {
  const { isLoading } = useLoading();
  const hasAnyLoading = isLoading();

  if (!hasAnyLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div className="h-full bg-gradient-to-r from-red-500 to-red-600 animate-pulse transition-all duration-300" 
           style={{ width: '70%' }} />
    </div>
  );
};
