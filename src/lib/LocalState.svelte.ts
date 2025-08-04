import { browser } from '$app/environment';

export class LocalStore<T> {
    value = $state<T>() as T;
    key = '';

    constructor(key: string, value: T) {
        this.key = key;
        this.value = value;

        if (browser) {
            const item = localStorage.getItem(key);
            if (item) this.value = this.deserialize(item);
        }

        $effect(() => {
            localStorage.setItem(this.key, this.serialize(this.value));
        });
    }

    serialize(value: T): string {
        let data = JSON.stringify(value);
        if (value instanceof Date) {
            data = JSON.stringify({ __type: 'Date', value: value.toISOString() });
        }
        return data;
    }

    deserialize(item: string): T {
        let data: any = JSON.parse(item);
        if (data && data.__type === 'Date') {
            return new Date(data.value) as T;
        }
        return data as T;
    }
}

// export function $LocalStore<T>(key: string, value: T) {
//     return new LocalStore(key, value);
// }