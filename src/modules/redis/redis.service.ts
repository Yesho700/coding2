
import { Inject, Injectable} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache){}

    async setData(key: string, value: string, ttl: number){
        await this.cacheManager.set(key, value, ttl);
    }

    async getData(key: string){
        return await this.cacheManager.get(key);
    }

    async deleteData(key: string){
        await this.cacheManager.del(key);
    }

    async resetCache() {
        await this.cacheManager.clear();
    }
}