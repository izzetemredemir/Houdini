import React, { useState } from 'react';
import Confetti from 'react-confetti';
import { copyToClipboard, downloadLLMsTxt } from '../../utils/llmsTxtFormatter';
import { useProfileRegistry } from '../../hooks/useProfileRegistry';
import { formatHashForDisplay } from '../../utils/profileHash';
import { useHoudiniNFT } from '../../hooks/useHoudiniNFT';
import { useRegisterNFT, useUpdateNFT, useConfirmTransaction, useFailTransaction } from '../../hooks/useIdentityNFTsAPI';
import { ProfileTypeNumber } from '../../types/llmsTxt';
import { useWaitForTransactionReceipt, useAccount } from 'wagmi';
import type { ProfileType } from '../../types/llmsTxt';

interface EditorStepProps {
  content: string;
  profileType: ProfileType;
  onContentChange: (content: string) => void;
  onNavigateToIdentities?: () => void;
}

export function EditorStep({ content, profileType, onContentChange, onNavigateToIdentities }: EditorStepProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [nftTxHash, setNftTxHash] = useState<`0x${string}`>();
  const [nftError, setNftError] = useState<string>();

  const { address } = useAccount();

  const {
    registerProfile,
    uploadStatus,
    error,
    result,
    isUploading,
  } = useProfileRegistry();

  const {
    mintIdentity,
    updateIdentity,
    findNFTByType,
    isWritePending: isNftPending,
    isContractConfigured,
  } = useHoudiniNFT();

  const registerNFT = useRegisterNFT();
  const updateNFT = useUpdateNFT();
  const confirmTransaction = useConfirmTransaction();
  const failTransaction = useFailTransaction();

  const { isSuccess: isNftSuccess, isLoading: isNftConfirming, data: receiptData } = useWaitForTransactionReceipt({
    hash: nftTxHash,
  });

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadLLMsTxt(content);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleSaveToStorage = async () => {
    try {
      console.log('[EditorStep] User clicked Save to 0G Storage');
      console.log('[EditorStep] Profile type:', profileType);
      console.log('[EditorStep] Content length:', content.length, 'characters');

      // Map ProfileType to number (for future use/metadata)
      const profileTypeNumber = profileType === 'Personal' ? 0 : profileType === 'Project' ? 1 : 2;
      console.log('[EditorStep] Profile type number:', profileTypeNumber);

      console.log('[EditorStep] Calling registerProfile...');
      await registerProfile(content, profileTypeNumber);

      console.log('[EditorStep] ✅ Upload successful!');
    } catch (err) {
      console.error('[EditorStep] ❌ Upload failed:', err);
      if (err instanceof Error) {
        console.error('[EditorStep] Error message:', err.message);
        console.error('[EditorStep] Error stack:', err.stack);
      }
    }
  };

  /**
   * Extract tokenId from NFT mint transaction receipt
   * Parses the Transfer event to get the newly minted token ID
   */
  const extractTokenIdFromReceipt = (receipt: any): number | null => {
    try {
      if (!receipt || !receipt.logs) {
        console.log('[EditorStep] No receipt or logs available');
        return null;
      }

      // Transfer event signature: Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
      const transferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

      // Find Transfer event from mint (from address 0x0)
      const transferLog = receipt.logs.find((log: any) => {
        return log.topics &&
               log.topics[0] === transferEventSignature &&
               log.topics[1] === '0x0000000000000000000000000000000000000000000000000000000000000000'; // from = 0x0 (mint)
      });

      if (transferLog && transferLog.topics && transferLog.topics.length >= 4) {
        // tokenId is the 4th topic (index 3)
        const tokenIdHex = transferLog.topics[3];
        const tokenId = parseInt(tokenIdHex, 16);

        console.log('[EditorStep] Extracted tokenId from receipt:', tokenId);
        return tokenId;
      }

      console.log('[EditorStep] Transfer event not found in receipt');
      return null;
    } catch (error) {
      console.error('[EditorStep] Error extracting tokenId:', error);
      return null;
    }
  };

  const handleMintOrUpdateNFT = async () => {
    if (!result) {
      setNftError('Please upload to 0G Storage first');
      return;
    }

    if (!isContractConfigured) {
      setNftError('NFT contract not configured. Please deploy the contract first.');
      return;
    }

    if (!address) {
      setNftError('Please connect your wallet');
      return;
    }

    try {
      setNftError(undefined);
      console.log('[EditorStep] Starting NFT operation...');

      // Get profile type as number
      const profileTypeNum = ProfileTypeNumber[profileType];
      console.log('[EditorStep] Profile type number:', profileTypeNum);

      // Check if user already has NFT for this profile type
      const existingNFT = findNFTByType(profileTypeNum);

      let txHash: `0x${string}`;
      const isUpdate = !!existingNFT;

      if (existingNFT) {
        // Update existing NFT
        console.log('[EditorStep] Updating existing NFT #', existingNFT.tokenId.toString());
        txHash = await updateIdentity(existingNFT.tokenId, result.og0RootHash);
        console.log('[EditorStep] ✅ NFT update TX sent:', txHash);
      } else {
        // Mint new NFT
        console.log('[EditorStep] Minting new NFT');
        txHash = await mintIdentity(result.og0RootHash, profileTypeNum);
        console.log('[EditorStep] ✅ NFT mint TX sent:', txHash);
      }

      setNftTxHash(txHash);

      // 🚀 IMMEDIATE DATABASE SAVE - Save to DB as soon as TX is sent
      console.log('[EditorStep] 💾 Immediately saving to database with pending status...');

      try {
        if (isUpdate) {
          // For updates, register with existing tokenId
          await registerNFT.mutateAsync({
            tokenId: Number(existingNFT.tokenId),
            transactionHash: txHash,
            walletAddress: address,
            profileType: profileTypeNum,
            og0RootHash: result.og0RootHash,
            storageRecordId: result.storageRecordId,
            status: 'pending',
            createdAt: new Date().toISOString(),
          });
          console.log('[EditorStep] ✅ Update NFT saved to DB with pending status');
        } else {
          // For new mints, save without tokenId
          await registerNFT.mutateAsync({
            transactionHash: txHash,
            walletAddress: address,
            profileType: profileTypeNum,
            og0RootHash: result.og0RootHash,
            storageRecordId: result.storageRecordId,
            status: 'pending',
            createdAt: new Date().toISOString(),
          });
          console.log('[EditorStep] ✅ New NFT saved to DB with pending status');
        }
      } catch (dbError) {
        console.error('[EditorStep] ⚠️ Failed to save to database immediately:', dbError);
        // Don't fail the whole operation if DB save fails
      }

    } catch (err: any) {
      console.error('[EditorStep] ❌ NFT operation failed:', err);
      setNftError(err.message || 'NFT operation failed');
    }
  };

  const getUploadStatusMessage = () => {
    switch (uploadStatus) {
      case 'preparing-file':
        return 'Preparing file for 0G Storage...';
      case 'computing-merkle':
        return 'Computing Merkle tree (verifying content)...';
      case 'uploading':
        return 'Uploading to 0G Storage network...';
      case 'confirming-tx':
        return 'Upload complete - Confirming transaction (this may take up to 60 seconds)...';
      default:
        return '';
    }
  };

  const lineCount = content.split('\n').length;

  // Log status changes
  React.useEffect(() => {
    if (uploadStatus !== 'idle') {
      console.log('[EditorStep] Upload status:', uploadStatus);
    }
  }, [uploadStatus]);

  React.useEffect(() => {
    if (result) {
      console.log('[EditorStep] ✅ Upload completed successfully!');
      console.log('[EditorStep] Result:', result);
    }
  }, [result]);

  React.useEffect(() => {
    if (error) {
      console.error('[EditorStep] ❌ Error occurred:', error);
    }
  }, [error]);

  // Monitor transaction and update status in database
  // This effect triggers when receipt data becomes available
  React.useEffect(() => {
    // Only proceed if we have receipt data and tx hash
    if (!receiptData || !nftTxHash) {
      return;
    }

    console.log('[EditorStep] 🔍 Receipt received! Updating transaction status in database...');
    console.log('[EditorStep] Receipt status:', receiptData.status);
    console.log('[EditorStep] Transaction hash:', nftTxHash);

    const updateTransactionStatus = async () => {
      try {
        // Check if transaction was successful
        if (receiptData.status === 'success') {
          console.log('[EditorStep] ✅ Transaction successful! Confirming in database...');

          // Extract tokenId from receipt for new mints
          const tokenId = extractTokenIdFromReceipt(receiptData);

          if (tokenId !== null) {
            console.log('[EditorStep] ✅ TokenId extracted:', tokenId);

            // Confirm transaction in database with tokenId
            await confirmTransaction.mutateAsync({
              transactionHash: nftTxHash,
              tokenId: tokenId,
              confirmedAt: new Date().toISOString(),
            });

            console.log('[EditorStep] ✅ Transaction confirmed in database with token ID:', tokenId);
          } else {
            console.error('[EditorStep] ⚠️ Could not extract tokenId from receipt');
            console.log('[EditorStep] This might be an update transaction (tokenId already exists)');

            // For updates, we still need to confirm but tokenId might already be in the DB
            // We'll try to confirm anyway - the backend will handle it
            try {
              // Use a placeholder tokenId of 0 for updates - backend will keep existing tokenId
              await confirmTransaction.mutateAsync({
                transactionHash: nftTxHash,
                tokenId: 0, // Placeholder
                confirmedAt: new Date().toISOString(),
              });
              console.log('[EditorStep] ✅ Update transaction confirmed in database');
            } catch (confirmErr) {
              console.error('[EditorStep] Failed to confirm update transaction:', confirmErr);
            }
          }
        } else if (receiptData.status === 'reverted') {
          console.log('[EditorStep] ❌ Transaction failed/reverted! Marking as failed in database...');

          // Mark transaction as failed
          await failTransaction.mutateAsync({
            transactionHash: nftTxHash,
          });

          console.log('[EditorStep] ✅ Transaction marked as failed in database');
          setNftError('Transaction failed. Please try again.');
        }
      } catch (err) {
        console.error('[EditorStep] ❌ Failed to update transaction status in backend:', err);
        if (err instanceof Error) {
          console.error('[EditorStep] Error message:', err.message);
          console.error('[EditorStep] Error stack:', err.stack);
        }
        // Don't show error to user as this is background operation
      }
    };

    updateTransactionStatus();
  }, [receiptData, nftTxHash]); // Trigger when receipt data or tx hash changes

  return (
    <div className="editor-step">
      {/* Confetti on successful upload */}
      {result && <Confetti recycle={false} numberOfPieces={500} gravity={0.3} />}

      <h3>Review & Edit Your Profile</h3>
      <p className="step-description">
        Your LLMs.txt profile is ready! You can edit it directly below, then copy or download.
      </p>

      <div className="editor-container">
        <div className="editor-header">
          <div className="editor-info">
            <span className="line-count">{lineCount} lines</span>
          </div>
          <div className="editor-actions">
            <button
              type="button"
              className="action-button copy"
              onClick={handleCopy}
            >
              {copySuccess ? (
                <>
                  <span className="icon">✓</span> Copied!
                </>
              ) : (
                <>
                  <span className="icon">📋</span> Copy
                </>
              )}
            </button>
            <button
              type="button"
              className="action-button download"
              onClick={handleDownload}
            >
              {downloadSuccess ? (
                <>
                  <span className="icon">✓</span> Downloaded!
                </>
              ) : (
                <>
                  <span className="icon">💾</span> Download
                </>
              )}
            </button>
          </div>
        </div>

        <textarea
          className="llms-txt-editor"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div className="editor-footer">
        {/* 0G Storage Upload Section */}
        <div className="registration-section">
          <h4>Save to 0G Storage</h4>
          <p className="section-description">
            Upload your profile to decentralized 0G Storage network with content verification
          </p>

          <button
            type="button"
            className="register-button"
            onClick={handleSaveToStorage}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <span className="spinner-small"></span>
                {getUploadStatusMessage()}
              </>
            ) : (
              <>
                <span className="icon">💾</span>
                Save to 0G Storage
              </>
            )}
          </button>

          {error && (
            <div className="error-message">
              <div className="error-header">❌ Upload Error</div>
              <div className="error-details">
                {error.message || 'Upload failed'}
              </div>
              {(error.message?.includes('insufficient') || error.message?.includes('balance')) && (
                <div className="error-hint">
                  💡 Make sure you have enough OG tokens in your wallet for storage fees.
                </div>
              )}
              {error.message?.includes('RPC') && (
                <div className="error-hint">
                  💡 This appears to be an RPC issue. The upload may have succeeded.
                  Check the transaction manually on the 0G Explorer.
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="success-message">
              <div className="success-header">
                ✅ Profile Successfully Saved to 0G Storage!
              </div>
              <div className="result-details">
                <div className="result-item">
                  <strong>Content Hash:</strong>
                  <code>{formatHashForDisplay(result.contentHash)}</code>
                </div>
                <div className="result-item">
                  <strong>0G Root Hash:</strong>
                  <code>{result.og0RootHash.substring(0, 20)}...{result.og0RootHash.substring(result.og0RootHash.length - 20)}</code>
                </div>
                <div className="result-item">
                  <strong>File Size:</strong>
                  <code>{result.fileSize} bytes</code>
                </div>
                <div className="result-item">
                  <strong>0G Storage Transaction:</strong>
                  <a
                    href={`https://chainscan-galileo.0g.ai/tx/${result.og0TxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on 0G Explorer →
                  </a>
                </div>
              </div>

              {/* NFT Minting Section */}
              {isContractConfigured && (
                <div className="nft-section" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                    🎫 On-chain Identity NFT
                  </h4>

                  {!nftTxHash || !isNftSuccess ? (
                    <>
                      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                        Create a soulbound NFT to permanently link your profile on-chain.
                      </p>
                      <button
                        type="button"
                        className="register-button"
                        onClick={handleMintOrUpdateNFT}
                        disabled={isNftPending}
                        style={{ width: '100%' }}
                      >
                        {isNftPending ? (
                          <>
                            <span className="spinner-small"></span>
                            Processing...
                          </>
                        ) : findNFTByType(ProfileTypeNumber[profileType]) ? (
                          <>
                            <span className="icon">🔄</span>
                            Update On-chain Identity
                          </>
                        ) : (
                          <>
                            <span className="icon">✨</span>
                            Generate On-chain Identity NFT
                          </>
                        )}
                      </button>

                      {isNftConfirming && nftTxHash && (
                        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#f59e0b', textAlign: 'center' }}>
                          <span className="spinner-small" style={{ marginRight: '0.5rem' }}></span>
                          Confirming transaction on blockchain...
                        </div>
                      )}

                      {nftError && (
                        <div className="error-message" style={{ marginTop: '1rem' }}>
                          <div className="error-header">❌ NFT Error</div>
                          <div className="error-details">{nftError}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="result-details">
                      <div style={{ fontSize: '0.875rem', color: '#10b981', marginBottom: '1rem' }}>
                        ✅ Identity NFT {findNFTByType(ProfileTypeNumber[profileType]) ? 'updated' : 'created'} successfully!
                      </div>
                      <div className="result-item">
                        <strong>Transaction:</strong>
                        <a
                          href={`https://chainscan-galileo.0g.ai/tx/${nftTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on 0G Explorer →
                        </a>
                      </div>
                      {onNavigateToIdentities && (
                        <button
                          type="button"
                          className="register-button"
                          onClick={onNavigateToIdentities}
                          style={{ width: '100%', marginTop: '1rem' }}
                        >
                          <span className="icon">🎯</span>
                          View My Identities
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!isContractConfigured && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
                  <p style={{ fontSize: '0.875rem', color: '#666' }}>
                    💡 <strong>NFT Feature:</strong> Deploy the HoudiniIdentityNFT contract to enable on-chain identity minting.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="usage-examples">
          <h4>How to Use This Profile</h4>
          <ul>
            <li>
              <strong>For AI Agents:</strong> Share your 0G Root Hash for verified identity
            </li>
            <li>
              <strong>For Projects:</strong> Include this in your repository or documentation
            </li>
            <li>
              <strong>For Personal Use:</strong> Share with AI tools to help them understand your Web3 identity
            </li>
          </ul>
        </div>

        <div className="next-steps">
          <p>
            <strong>Quick Actions:</strong>
          </p>
          <ul>
            <li>Copy the profile for immediate use</li>
            <li>Download as llms.txt file</li>
            <li>Save to 0G Storage for decentralized access</li>
            <li>Share your Root Hash with AI agents</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
