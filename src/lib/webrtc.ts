export function createPeerConnection(onTrack: (ev: RTCTrackEvent) => void) {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: ["stun:stun.l.google.com:19302"] },
    ],
  });
  pc.ontrack = onTrack;
  return pc;
}

export async function createOffer(pc: RTCPeerConnection) {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
}

export async function acceptOffer(pc: RTCPeerConnection, offer: RTCSessionDescriptionInit) {
  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
}

export async function acceptAnswer(pc: RTCPeerConnection, answer: RTCSessionDescriptionInit) {
  await pc.setRemoteDescription(answer);
}
