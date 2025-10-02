import { create } from 'zustand';
import type {
  EditorState,
  Layer,
  AppliedFilter,
  Adjustment,
} from '../types/editor.types';
import { DEFAULT_ADJUSTMENTS } from '../utils/constants';

interface EditorStore extends EditorState {
  // Actions
  addLayer: (layer: Layer) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  removeLayer: (layerId: string) => void;
  setActiveLayer: (layerId: string | null) => void;
  setCanvasSize: (width: number, height: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  applyFilter: (filter: AppliedFilter) => void;
  removeFilter: (filterId: string) => void;
  updateAdjustment: (key: keyof Adjustment, value: number) => void;
  resetAdjustments: () => void;
  undo: () => void;
  redo: () => void;
  addHistoryState: (action: string) => void;
  reset: () => void;
}

const initialState: EditorState = {
  layers: [],
  activeLayerId: null,
  canvasSize: { width: 0, height: 0 },
  zoom: 1,
  pan: { x: 0, y: 0 },
  history: [],
  historyIndex: -1,
  filters: [],
  adjustments: DEFAULT_ADJUSTMENTS,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  addLayer: layer => {
    set(state => ({
      layers: [...state.layers, layer],
      activeLayerId: layer.id,
    }));
    get().addHistoryState(`Add ${layer.type}`);
  },

  updateLayer: (layerId, updates) =>
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === layerId ? { ...layer, ...updates } : layer,
      ),
    })),

  removeLayer: layerId =>
    set(state => ({
      layers: state.layers.filter(layer => layer.id !== layerId),
      activeLayerId:
        state.activeLayerId === layerId ? null : state.activeLayerId,
    })),

  setActiveLayer: layerId => set({ activeLayerId: layerId }),

  setCanvasSize: (width, height) => set({ canvasSize: { width, height } }),

  setZoom: zoom => set({ zoom }),

  setPan: (x, y) => set({ pan: { x, y } }),

  applyFilter: filter => {
    set(state => ({
      filters: [...state.filters, filter],
    }));
    get().addHistoryState(`Apply ${filter.name} filter`);
  },

  removeFilter: filterId =>
    set(state => ({
      filters: state.filters.filter(f => f.id !== filterId),
    })),

  updateAdjustment: (key, value) => {
    set(state => ({
      adjustments: {
        ...state.adjustments,
        [key]: value,
      },
    }));
    get().addHistoryState(`Adjust ${key}`);
  },

  resetAdjustments: () => set({ adjustments: DEFAULT_ADJUSTMENTS }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex].editorState;
      set({
        ...state,
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex].editorState;
      set({
        ...state,
        historyIndex: newIndex,
      });
    }
  },

  addHistoryState: action => {
    const state = get();
    const newState = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      action,
      editorState: {
        layers: state.layers,
        activeLayerId: state.activeLayerId,
        canvasSize: state.canvasSize,
        zoom: state.zoom,
        pan: state.pan,
        history: state.history,
        historyIndex: state.historyIndex,
        filters: state.filters,
        adjustments: state.adjustments,
      },
    };

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newState);

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  reset: () => set(initialState),
}));
