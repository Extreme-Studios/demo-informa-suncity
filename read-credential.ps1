# Server-only helper. Output goes directly to the Node process, never a log.
$ErrorActionPreference = 'Stop'
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class SuncityCredential {
 [DllImport("advapi32.dll", EntryPoint="CredReadW", CharSet=CharSet.Unicode, SetLastError=true)] public static extern bool Read(string target, uint type, uint flags, out IntPtr credential);
 [DllImport("advapi32.dll")] public static extern void CredFree(IntPtr credential);
 [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)] public struct Credential { public uint Flags; public uint Type; public string TargetName; public string Comment; public long LastWritten; public uint CredentialBlobSize; public IntPtr CredentialBlob; public uint Persist; public uint AttributeCount; public IntPtr Attributes; public string TargetAlias; public string UserName; }
}
'@
$pointer = [IntPtr]::Zero
if (![SuncityCredential]::Read('gemini:antigravity',1,0,[ref]$pointer)) { exit 2 }
try {
 $credential = [Runtime.InteropServices.Marshal]::PtrToStructure($pointer,[type][SuncityCredential+Credential])
 $bytes = New-Object byte[] $credential.CredentialBlobSize
 [Runtime.InteropServices.Marshal]::Copy($credential.CredentialBlob,$bytes,0,$bytes.Length)
 $candidates = @([Text.Encoding]::Unicode.GetString($bytes),[Text.Encoding]::UTF8.GetString($bytes))
 foreach ($candidate in $candidates) { if ($candidate -match '(AIza[0-9A-Za-z_-]{30,})') { [Console]::Out.Write($matches[1]); exit 0 } }
 exit 3
} finally { [SuncityCredential]::CredFree($pointer) }
