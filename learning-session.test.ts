import { LearningSession } from './learning-session';
import { TFile } from 'obsidian';
import {KV} from 'kv-synced';

describe("Learning session", () => {
    test("Test session", () => {
        const files = [
            {path: 'ignored'} as TFile,
            {path: 'future'} as TFile,
            {path: 'today'} as TFile,
            {path: 'yesterday'} as TFile,
            {path: 'new1'} as TFile,
            {path: 'new2'} as TFile,
        ];
        const kv_u = {
            load: jest.fn(),
            get: jest.fn().mockImplementation((key) => {
                if (key === 'ignored') {
                    return {
                        "ignored":"true"
                    }
                }
                if (key === 'today') {
                    return {
                        "scheduledAt": "" + todayPlus(0).toISOString()
                    }
                }
                if (key === 'future') {
                    return {
                        "scheduledAt": "" + todayPlus(10).toISOString()
                    }
                }
                if (key === 'yesterday') {
                    return {
                        "scheduledAt": "" + todayPlus(-1).toISOString()
                    }
                }
                if (key === 'new1' || key === 'new2') {
                    return undefined;
                }
            }),
            put: jest.fn(),
            commit: jest.fn(),
            size: jest.fn(),
        } as unknown;
        const kv = kv_u as KV;

        const session = new LearningSession(kv, files);
        expect(session.getTodaysCount()).toBe(1);
        expect(session.getLateCount()).toBe(1);
        expect(session.getNewCount()).toBe(2);
        expect(session.hasMoreCards).toBeTruthy();
    });
});

function todayPlus(days: number): Date {
    const result = new Date();
    result.setDate(result.getDate() + days);
    //result.setHours(0, 0, 0, 0);
    return result;
}

export {}
