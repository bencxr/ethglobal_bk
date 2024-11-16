using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

public class HUD : MonoBehaviour
{
    public GameController GameController;
    VisualElement Root;
    VisualElement Bananas;
    Label BananasQty;
    VisualElement Coins;
    VisualElement BananasIcon;

    // Start is called before the first frame update
    void Start()
    {
        Root = GetComponent<UIDocument>().rootVisualElement;
        Bananas = Root.Q<VisualElement>("Bananas");
        BananasIcon = Root.Q<VisualElement>("BananaIcon");
        BananasQty = Root.Q<Label>("BananaQty");
        Coins = Root.Q<VisualElement>("Coins");

        BananasIcon.RegisterCallback<ClickEvent>(FeedElephant);
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void ShowBananas()
    {
        Bananas.style.display = DisplayStyle.Flex;
    }

    public void ShowCoins()
    {
        Bananas.style.display = DisplayStyle.Flex;
    }

    public void ShowPlantation()
    {
        
    }

    void FeedElephant(ClickEvent e)
    {
        GameController.FeedElephant();
    }

    public void SetBananas(int numBananas)
    {
        BananasQty.text = numBananas.ToString();
    }
}
