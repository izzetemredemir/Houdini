/**
 * Storage Records Page
 *
 * Displays all 0G Storage upload records from the database
 */

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
  getAllStorageRecords,
  getStorageRecordsByWallet,
  getStorageStats,
} from '../api/storageRecords';
import type { StorageRecord, StorageStats } from '../types/storageRecords';
import { getProfileTypeName } from '../types/storageRecords';
import '../styles/StorageRecords.css';

export function StorageRecords() {
  const { address } = useAccount();
  const [records, setRecords] = useState<StorageRecord[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterByWallet, setFilterByWallet] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StorageRecord | null>(null);

  useEffect(() => {
    loadRecords();
    loadStats();
  }, [filterByWallet, address]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      if (filterByWallet && address) {
        const response = await getStorageRecordsByWallet(address);
        setRecords(response.records);
      } else {
        const response = await getAllStorageRecords(100, 0);
        setRecords(response.records);
      }
    } catch (err) {
      console.error('Failed to load records:', err);
      setError(err instanceof Error ? err.message : 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getStorageStats();
      setStats(response.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const formatHash = (hash: string, chars = 10) => {
    if (hash.length <= chars * 2) return hash;
    return `${hash.substring(0, chars)}...${hash.substring(hash.length - chars)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleRefresh = () => {
    loadRecords();
    loadStats();
  };

  return (
    <div className="storage-records-page">
      <div className="page-header">
        <h1>0G Storage Records</h1>
        <p className="page-description">
          All llms.txt profiles uploaded to 0G decentralized storage network
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalRecords}</div>
            <div className="stat-label">Total Records</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.uniqueWallets}</div>
            <div className="stat-label">Unique Wallets</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatFileSize(stats.totalFileSize)}</div>
            <div className="stat-label">Total Storage Used</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatFileSize(stats.averageFileSize)}</div>
            <div className="stat-label">Average File Size</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="controls">
        <div className="filter-controls">
          {address && (
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filterByWallet}
                onChange={(e) => setFilterByWallet(e.target.checked)}
              />
              <span>Show only my records</span>
            </label>
          )}
        </div>
        <button className="refresh-button" onClick={handleRefresh}>
          🔄 Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading records...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={handleRefresh}>Try Again</button>
        </div>
      )}

      {/* Records Table */}
      {!loading && !error && (
        <>
          {records.length === 0 ? (
            <div className="empty-state">
              <p>📭 No storage records found</p>
              {filterByWallet && (
                <button onClick={() => setFilterByWallet(false)}>
                  Show all records
                </button>
              )}
            </div>
          ) : (
            <div className="records-table-container">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Wallet</th>
                    <th>Type</th>
                    <th>Root Hash</th>
                    <th>Content Hash</th>
                    <th>Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td className="date-cell">{formatDate(record.created_at)}</td>
                      <td className="hash-cell">
                        <code>{formatHash(record.wallet_address, 6)}</code>
                      </td>
                      <td>
                        <span className="profile-type-badge">
                          {getProfileTypeName(record.profile_type)}
                        </span>
                      </td>
                      <td className="hash-cell">
                        <code>{formatHash(record.og0_root_hash, 8)}</code>
                      </td>
                      <td className="hash-cell">
                        <code>{formatHash(record.content_hash, 8)}</code>
                      </td>
                      <td>{formatFileSize(record.file_size)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="view-button"
                            onClick={() => setSelectedRecord(record)}
                            title="View Details"
                          >
                            👁️
                          </button>
                          <a
                            href={`https://chainscan-galileo.0g.ai/tx/${record.og0_tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="explorer-link"
                            title="View on 0G Explorer"
                          >
                            🔗
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Storage Record Details</h3>
              <button className="close-button" onClick={() => setSelectedRecord(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>ID:</strong>
                <span>{selectedRecord.id}</span>
              </div>
              <div className="detail-row">
                <strong>Created:</strong>
                <span>{formatDate(selectedRecord.created_at)}</span>
              </div>
              <div className="detail-row">
                <strong>Wallet Address:</strong>
                <code className="full-hash">{selectedRecord.wallet_address}</code>
              </div>
              <div className="detail-row">
                <strong>Profile Type:</strong>
                <span>{getProfileTypeName(selectedRecord.profile_type)}</span>
              </div>
              <div className="detail-row">
                <strong>0G Root Hash:</strong>
                <code className="full-hash">{selectedRecord.og0_root_hash}</code>
              </div>
              <div className="detail-row">
                <strong>Content Hash:</strong>
                <code className="full-hash">{selectedRecord.content_hash}</code>
              </div>
              <div className="detail-row">
                <strong>Transaction Hash:</strong>
                <a
                  href={`https://chainscan-galileo.0g.ai/tx/${selectedRecord.og0_tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="explorer-link-full"
                >
                  {selectedRecord.og0_tx_hash} →
                </a>
              </div>
              <div className="detail-row">
                <strong>File Size:</strong>
                <span>{formatFileSize(selectedRecord.file_size)} ({selectedRecord.file_size} bytes)</span>
              </div>
              {selectedRecord.content && (
                <div className="detail-row content-preview">
                  <strong>Content Preview:</strong>
                  <pre className="content-box">{selectedRecord.content.substring(0, 500)}{selectedRecord.content.length > 500 ? '...' : ''}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
