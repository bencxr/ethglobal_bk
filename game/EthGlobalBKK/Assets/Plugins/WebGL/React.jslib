mergeInto(LibraryManager.library, {
  PromptLogin: function () {
    window.dispatchReactUnityEvent("PromptLogin");
  },
  PromptFunding: function () {
    window.dispatchReactUnityEvent("PromptFunding");
  },
  DepositAll: function () {
    window.dispatchReactUnityEvent("DepositAll");
  },
  StoreBlob: function (blob) {
    window.dispatchReactUnityEvent("StoreBlob", UTF8ToString(blob));
  },
});