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
    public Modal _Modal;
    public GameObject Egg;
    public GameObject Elephant;
    public GameObject Monkey;
    public HUD _HUD;
    public GameObject Banana;
    public GameObject Jungle;
    public GameObject Plantation;

    int NumBananas;
    int NumCoins;
    int NumBananaTrees;
    LoginResponse LoginSession;

    [DllImport("__Internal")]
    private static extern void PromptLogin ();

    [DllImport("__Internal")]
    private static extern void PromptFunding ();

    [DllImport("__Internal")]
    private static extern void DepositAll ();


    private bool HasLoggedIn = false;

    // Start is called before the first frame update
    void Start()
    {
        NumBananas = 5;
        _HUD.SetBananas(NumBananas);

        #if !UNITY_EDITOR && UNITY_WEBGL
        // disable WebGLInput.captureAllKeyboardInput so elements in web page can handle keyboard inputs
            WebGLInput.captureAllKeyboardInput = false;
        #endif
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

        // string mock = @"{""loggedIn"":true,""gameBlob"":""{\""\""peanuts\"":\""yes\""}"",""user"":{""name"":""Benedict Chan"",""email"":""bencxr@fragnetics.com"",""address"":""0x4F7bb64Ac069Bb3A6a0332d9F8f844a5819daA17""},""balances"":{""base"":0.002,""usdc"":1,""ausdc"":1.000024}}";
        //LoginEvent(mock);
    }

    public void PromptPlantation()
    {
        _DialogueManager.SetMainText($"Hi {LoginSession.user.name.Split(" ")[0]}, you're out of bananas. Let's go get more.");
        _HUD.ShowPlantation();
    }

    public void LoginEvent(string json)
    {   
        UpdateState(json);

        if (!HasLoggedIn)
        {
            HasLoggedIn = true;
            PromptPlantation();
        }
    }

    public void UpdateState(string json)
    {
        LoginSession = JsonUtility.FromJson<LoginResponse>(json);
        NumCoins = (int)LoginSession.balances.usdc;
        NumBananaTrees = (int)LoginSession.balances.ausdc;
        _HUD.SetCoins(NumCoins);
        _HUD.SetTrees(NumBananaTrees);
    }

    public void GoToPlantation()
    {
        IsInPlantation = true;
        Jungle.SetActive(false);
        Plantation.SetActive(true);
        Elephant.SetActive(false);
        Monkey.SetActive(true);
        _HUD.TogglePlantationButton(false);
        _DialogueManager.HideDialogue();
    }

    public void GoToHome()
    {
        IsInPlantation = false;
        Jungle.SetActive(true);
        Plantation.SetActive(false);
        Elephant.SetActive(true);
        Monkey.SetActive(false);
        _HUD.TogglePlantationButton(true);
        _DialogueManager.HideDialogue();
    }

    public void PromptUserWelcome()
    {
        _HUD.ShowCoins();
        _HUD.ShowTrees();
        _DialogueManager.HideDialogue();
        _Modal.ShowWelcome();
    }

    public void TriggerFunding()
    {
        #if UNITY_WEBGL == true && UNITY_EDITOR == false
            PromptFunding ();
        #endif
    }

    public void ConfirmDepost()
    {
        _Modal.ShowConfirmation();
    }

    public void TriggerDeposit()
    {
        #if UNITY_WEBGL == true && UNITY_EDITOR == false
            DepositAll ();
        #endif
    }
}
