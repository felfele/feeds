import { Model } from './Model';
import { printableElapsedTime } from '../helpers/dateHelpers';

export interface ContentFilter extends Model {
    text: string;
    createdAt: number;
    validUntil: number;
}

export const filterValidUntilToText = (validUntil: number): string => {
    if (validUntil === 0) {
        return 'forever';
    }
    return printableElapsedTime(0, validUntil);
};
