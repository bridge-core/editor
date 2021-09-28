export enum ERequestState {
	Success,
	Deleted,
	NotFound,
	Undefined,
}

export class RequestStatus<T = Uint8Array> {
	constructor(public value?: T, public state = ERequestState.Success) {}

	static createNotFound() {
		return new RequestStatus(undefined, ERequestState.NotFound)
	}
	static createDeleted() {
		return new RequestStatus(undefined, ERequestState.Deleted)
	}
}
