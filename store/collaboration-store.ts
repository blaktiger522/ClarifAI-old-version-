import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CollaborationSettings {
  isPublic: boolean;
  allowEditing: boolean;
  sharedWith: string[];
}

interface CollaboratorRole {
  email: string;
  role: 'viewer' | 'editor';
}

interface CollaborationState {
  sharedTranscriptions: Record<string, CollaborationSettings>;
  collaboratorRoles: Record<string, CollaboratorRole[]>;
  
  shareTranscription: (id: string, settings: CollaborationSettings) => void;
  getCollaborators: (id: string) => string[];
  removeCollaborator: (id: string, email: string) => void;
  updateCollaboratorRole: (id: string, email: string, role: 'viewer' | 'editor') => void;
  isTranscriptionShared: (id: string) => boolean;
}

export const useCollaborationStore = create<CollaborationState>()(
  persist(
    (set, get) => ({
      sharedTranscriptions: {},
      collaboratorRoles: {},
      
      shareTranscription: (id, settings) => set((state) => ({
        sharedTranscriptions: {
          ...state.sharedTranscriptions,
          [id]: settings
        },
        collaboratorRoles: {
          ...state.collaboratorRoles,
          [id]: settings.sharedWith.map(email => ({
            email,
            role: 'viewer'
          }))
        }
      })),
      
      getCollaborators: (id) => {
        const settings = get().sharedTranscriptions[id];
        return settings?.sharedWith || [];
      },
      
      removeCollaborator: (id, email) => set((state) => {
        const settings = state.sharedTranscriptions[id];
        if (!settings) return state;
        
        return {
          sharedTranscriptions: {
            ...state.sharedTranscriptions,
            [id]: {
              ...settings,
              sharedWith: settings.sharedWith.filter(e => e !== email)
            }
          },
          collaboratorRoles: {
            ...state.collaboratorRoles,
            [id]: (state.collaboratorRoles[id] || []).filter(c => c.email !== email)
          }
        };
      }),
      
      updateCollaboratorRole: (id, email, role) => set((state) => {
        const roles = state.collaboratorRoles[id] || [];
        
        return {
          collaboratorRoles: {
            ...state.collaboratorRoles,
            [id]: roles.map(c => 
              c.email === email ? { ...c, role } : c
            )
          }
        };
      }),
      
      isTranscriptionShared: (id) => {
        return !!get().sharedTranscriptions[id];
      }
    }),
    {
      name: 'collaboration-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
