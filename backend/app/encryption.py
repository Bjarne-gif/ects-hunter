"""
AES-256-GCM file encryption with PBKDF2-derived keys.
Format: MAGIC(7) | VERSION(1) | SALT(16) | NONCE(12) | CIPHERTEXT
"""
import os
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

MAGIC = b"FERNUNI"
VERSION = b"\x01"
HEADER_SIZE = 8 + 16 + 12  # magic+version + salt + nonce = 36


def _derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480_000,
    )
    return kdf.derive(password.encode("utf-8"))


def encrypt_bytes(data: bytes, password: str) -> bytes:
    salt = os.urandom(16)
    nonce = os.urandom(12)
    key = _derive_key(password, salt)
    ciphertext = AESGCM(key).encrypt(nonce, data, None)
    return MAGIC + VERSION + salt + nonce + ciphertext


def decrypt_bytes(data: bytes, password: str) -> bytes:
    if not data.startswith(MAGIC):
        raise ValueError("Ungültige Datenbankdatei – kein FernUni-Format erkannt.")
    salt = data[8:24]
    nonce = data[24:36]
    ciphertext = data[36:]
    key = _derive_key(password, salt)
    try:
        return AESGCM(key).decrypt(nonce, ciphertext, None)
    except InvalidTag:
        raise ValueError("Falsches Passwort oder beschädigte Datenbankdatei.")
