// UI actions
export enum UIActionTypes {
  CLOSE = 'CLOSE',
  NOTIFY = 'NOTIFY',
}

export interface UIAction {
  type: UIActionTypes;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}
