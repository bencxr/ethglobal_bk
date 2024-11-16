using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;
using System.Runtime.InteropServices;

public class GameController : MonoBehaviour
{
    public DialogueManager _DialogueManager;
    public GameObject Egg;
    public GameObject Elephant;
    public HUD _HUD;
    public GameObject Banana;

    int NumBananas;

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
    }

    public void PromptPlantation()
    {
        _DialogueManager.SetMainText("Lets go to the plantation and get some bananas!");
        _HUD.ShowPlantation();
    }
}
