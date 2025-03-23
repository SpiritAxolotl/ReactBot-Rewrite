// Assembly-CSharp, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null
// RandomVideoPlayer
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Video;
using UnityRawInput;

public class RandomVideoPlayer : MonoBehaviour
{
	public VideoPlayer videoPlayer;

	public List<string> videoClips = new List<string>();

	public RawKey playKey = RawKey.Space;

	private bool isPlaying;

	private void HandleKeyDown(RawKey key)
	{
		if (key == playKey && !isPlaying)
		{
			StartCoroutine(PlayRandomVideo());
		}
	}

	private void Start()
	{
		RawInput.WorkInBackground = true;
		Application.targetFrameRate = 60;
		RawInput.Start();
		RawInput.OnKeyDown += HandleKeyDown;
		string[] files = Directory.GetFiles(Application.streamingAssetsPath + "/GrabBag");
		foreach (string text in files)
		{
			if (text.EndsWith(".mp4"))
			{
				videoClips.Add(text);
			}
		}
	}

	private IEnumerator PlayRandomVideo()
	{
		videoPlayer.url = videoClips[Random.Range(0, videoClips.Count)];
		videoPlayer.gameObject.SetActive(value: true);
		videoPlayer.Prepare();
		yield return new WaitUntil(() => videoPlayer.isPrepared);
		double length = videoPlayer.length;
		videoPlayer.Play();
		isPlaying = true;
		yield return new WaitForSeconds((float)length);
		OnVideoEnded();
	}

	private IEnumerator VideoTimer(double time)
	{
		yield return new WaitForSeconds((float)time);
		OnVideoEnded();
	}

	private void OnVideoEnded()
	{
		isPlaying = false;
		videoPlayer.gameObject.SetActive(value: false);
	}

	private void OnApplicationQuit()
	{
		RawInput.Stop();
	}
}