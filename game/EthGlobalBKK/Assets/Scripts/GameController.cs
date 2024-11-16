using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;
using System.Runtime.InteropServices;
using UnityEngine.SceneManagement;

[System.Serializable]
public class LoginResponse
{
    public bool loggedIn;
    public string gameBlob;
    public UserInfo user;
    public Balances balances;
}

[System.Serializable]
public class UserInfo
{
    public string name;
    public string email;
    public string address;
}

[System.Serializable]
public class Balances
{
    public double @base;  // Using @ because 'base' is a C# keyword
    public double usdc;
    public double ausdc;
}

public class GameController : MonoBehaviour
{
    public bool IsInPlantation = false;
    public DialogueManager _DialogueManager;
    public GameObject Egg;
    public GameObject Elephant;
    public GameObject Monkey;
    public HUD _HUD;
    public GameObject Banana;
    public GameObject Jungle;
    public GameObject Plantation;

    int NumBananas;
    LoginResponse LoginSession;

    [DllImport("__Internal")]
    private static extern void PromptLogin ();

    // Start is called before the first frame update
    void Start()
    {
        NumBananas = 5;
        _HUD.SetBananas(NumBananas);
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void HatchElephant()
    {
        Egg.SetActive(false);
        Elephant.SetActive(true);
        _DialogueManager.HatchElephantText();
    }

    public void PromptBanana()
    {
        _HUD.ShowBananas();
    }

    public void FeedElephant()
    {
        SpawnBanana();
    }

    public void SpawnBanana()
    {
        if (NumBananas > 0)
        {
            Instantiate(Banana, new Vector3(Random.Range(-1f, 1f), 5, 0), Quaternion.identity);
            NumBananas--;
            _HUD.SetBananas(NumBananas);
        }
        
    }

    public void TriggerLogin()
    {
        Debug.Log("Login Triggered");
        _DialogueManager.PromptLogin();

        #if UNITY_WEBGL == true && UNITY_EDITOR == false
            PromptLogin ();
        #endif

        string mock = @"{""loggedIn"":true,""gameBlob"":""{\""\""peanuts\"":\""yes\""}"",""user"":{""name"":""Benedict Chan"",""email"":""bencxr@fragnetics.com"",""address"":""0x4F7bb64Ac069Bb3A6a0332d9F8f844a5819daA17""},""balances"":{""base"":0.002,""usdc"":1,""ausdc"":1.000024}}";
        LoginEvent(mock);
    }

    public void PromptPlantation()
    {
        _DialogueManager.SetMainText($"Hi {LoginSession.user.name.Split(" ")[0]}, you're out of bananas. Let's go get more.");
        _HUD.ShowPlantation();
    }

    public void LoginEvent(string json)
    {   
        Debug.Log("Login Event: " + json);
        LoginSession = JsonUtility.FromJson<LoginResponse>(json);
        Debug.Log($"User logged in: {LoginSession.user.name} with address: {LoginSession.user.address}");

        PromptPlantation();
    }

    public void GoToPlantation()
    {
        IsInPlantation = true;
        Jungle.SetActive(false);
        Plantation.SetActive(true);
        Elephant.SetActive(false);
        Monkey.SetActive(true);
        _HUD.TogglePlantationButton(false);
    }

    public void GoToHome()
    {
        IsInPlantation = false;
        Jungle.SetActive(true);
        Plantation.SetActive(false);
        Elephant.SetActive(true);
        Monkey.SetActive(false);
        _HUD.TogglePlantationButton(true);
    }
}
