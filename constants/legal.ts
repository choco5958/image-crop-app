export type LegalContent = {
  lastUpdated: string;
  sections: {
    title: string;
    content: string;
    bullets?: string[];
  }[];
  footer: string;
};

export const PRIVACY_CONTENT: Record<string, LegalContent> = {
  ko: {
    lastUpdated: '최종 수정일: 2026년 3월 25일',
    sections: [
      {
        title: '1. 수집하는 개인정보 항목',
        content: 'CropLab은 사용자의 이미지를 서버에 업로드하지 않습니다. 모든 이미지 편집 및 처리는 사용자의 기기 내에서 로컬로 수행됩니다. 앱 기능을 제공하기 위해 다음과 같은 정보에 접근할 수 있습니다:',
        bullets: [
          '카메라 및 사진 라이브러리: 편집할 이미지를 선택하고 저장하기 위해 필요합니다.',
          '기기 정보: 앱 성능 개선 및 오류 수정을 위해 기기 모델명, OS 버전 등을 수집할 수 있습니다.'
        ]
      },
      {
        title: '2. 개인정보의 이용 목적',
        content: '수집된 정보는 앱의 원활한 기능 제공, 서비스 개선, 고객 지원 및 통계 분석을 위해서만 사용됩니다.'
      },
      {
        title: '3. 제3자 서비스 제공',
        content: 'CropLab은 광고 기능을 위해 Google AdMob 서비스를 사용합니다. AdMob은 광고 개인화를 위해 광고 ID 등을 수집할 수 있으며, 이는 Google의 개인정보 처리방침에 따릅니다.'
      },
      {
        title: '4. 개인정보의 보관 및 파기',
        content: '사용자의 이미지는 서버에 저장되지 않으므로 별도의 보관 및 파기 절차가 앱 수준에서 존재하지 않습니다. 기기에 수집된 로그 정보는 앱 삭제 시 함께 제거됩니다.'
      }
    ],
    footer: '문의 사항이 있으시면 설정 메뉴의 문의하기를 이용해 주세요.'
  },
  en: {
    lastUpdated: 'Last Updated: March 25, 2026',
    sections: [
      {
        title: '1. Information We Collect',
        content: 'CropLab does not upload your images to any server. All image editing and processing are performed locally on your device. To provide app features, we may access the following:',
        bullets: [
          'Camera and Photo Library: Required to select and save images for editing.',
          'Device Information: We may collect device model, OS version, etc., for performance improvement and bug fixes.'
        ]
      },
      {
        title: '2. Use of Information',
        content: 'The collected information is used solely forProviding smooth app functionality, service improvement, customer support, and statistical analysis.'
      },
      {
        title: '3. Third-Party Services',
        content: 'CropLab uses Google AdMob for advertising features. AdMob may collect Advertising IDs for ad personalization, subject to Google\'s Privacy Policy.'
      },
      {
        title: '4. Data Retention and Deletion',
        content: 'Since your images are not stored on our servers, there is no separate retention or deletion process at the app level. Log information collected on the device is removed when the app is deleted.'
      }
    ],
    footer: 'If you have any questions, please use the contact option in the Settings menu.'
  },
  ja: {
    lastUpdated: '最終更新日: 2026年3月25日',
    sections: [
      {
        title: '1. 収集する個人情報の項目',
        content: 'CropLabは、ユーザーの画像をサーバーにアップロードしません。すべての画像編集および処理は、ユーザーのデバイス内でローカルに実行されます。アプリの機能を提供するために、以下の情報にアクセスする場合があります：',
        bullets: [
          'カメラおよび写真ライブラリ：編集する画像を選択して保存するために必要です。',
          'デバイス情報：アプリのパフォーマンス改善およびエラー修正のために、デバイスのモデル名、OSバージョンなどを収集する場合があります。'
        ]
      },
      {
        title: '2. 個人情報の利用目的',
        content: '収集された情報は、アプリの円滑な機能提供、サービスの改善、カスタマーサポート、および統計分析のためにのみ使用されます。'
      },
      {
        title: '3. 第三者サービスの提供',
        content: 'CropLabは、広告機能のためにGoogle AdMobサービスを使用しています。AdMobは、広告のパーソナライズのために広告IDなどを収集する場合があり、これはGoogleのプライバシーポリシーに従います。'
      },
      {
        title: '4. 個人情報の保管および破棄',
        content: 'ユーザーの画像はサーバーに保存されないため、アプリレベルでの個別の保管および破棄の手順は存在しません。デバイスに収集されたログ情報は、アプリの削除時に一緒に削除されます。'
      }
    ],
    footer: 'ご不明な点がございましたら、設定メニューの「お問い合わせ」をご利用ください。'
  },
  zh: {
    lastUpdated: '最后更新日期：2026年3月25日',
    sections: [
      {
        title: '1. 我们收集的信息',
        content: 'CropLab 不会将您的图像上传到任何服务器。所有图像编辑和处理均在您的设备上本地执行。为了提供应用功能，我们可能会访问以下内容：',
        bullets: [
          '相机和相册：用于选择和保存要编辑的图像。',
          '设备信息：我们可能会收集设备型号、操作系统版本等，用于性能改进和错误修复。'
        ]
      },
      {
        title: '2. 信息的使用',
        content: '收集的信息仅用于提供流畅的应用功能、改进服务、客户支持和统计分析。'
      },
      {
        title: '3. 第三方服务',
        content: 'CropLab 使用 Google AdMob 提供广告功能。AdMob 可能会收集广告 ID 以进行广告个性化，这受 Google 隐私政策的约束。',
      },
      {
        title: '4. 数据的保存与删除',
        content: '由于您的图像不存储在我们的服务器上，因此应用层面不存在单独的保存或删除程序。设备上收集的日志信息将在删除应用时一同移除。'
      }
    ],
    footer: '如有任何疑问，请使用设置菜单中的联系选项。'
  }
};

export const TERMS_CONTENT: Record<string, LegalContent> = {
  ko: {
    lastUpdated: '최종 수정일: 2026년 3월 25일',
    sections: [
      {
        title: '1. 서비스의 목적',
        content: 'CropLab은 사용자가 이미지를 쉽고 편리하게 편집하고 저장할 수 있도록 기능을 제공하는 서비스입니다. 본 약관은 사용자가 서비스를 이용함에 있어 필요한 기본 사항을 규정합니다.'
      },
      {
        title: '2. 서비스 이용 제한',
        content: '사용자는 다음과 같은 행위를 해서는 안 됩니다:',
        bullets: [
          '불법적인 콘텐츠를 편집하거나 배포하는 행위',
          '타인의 저작권을 침해하는 이미지를 무단으로 사용하는 행위',
          '앱을 비정상적인 방법으로 조작하거나 기능을 훼손하는 행위'
        ]
      },
      {
        title: '3. 지적 재산권',
        content: '제공되는 앱의 디자인, 로고, 소스 코드 등 모든 지적 재산권은 CropLab에 귀속됩니다. 사용자가 편집하여 생성한 이미지의 권리는 사용자 본인에게 있습니다.'
      },
      {
        title: '4. 면책 조항',
        content: 'CropLab은 제공되는 서비스의 정확성이나 안정성을 보장하지 않으며, 서비스 이용 중 발생할 수 있는 데이터 손실 등에 대해 책임을 지지 않습니다. 모든 편집 및 저장은 사용자의 책임 하에 수행됩니다.'
      }
    ],
    footer: 'CropLab을 이용해 주셔서 감사합니다.'
  },
  en: {
    lastUpdated: 'Last Updated: March 25, 2026',
    sections: [
      {
        title: '1. Purpose of Service',
        content: 'CropLab provides functions for users to easily and conveniently edit and save images. These terms stipulate the basic matters required for users to use the service.'
      },
      {
        title: '2. Restrictions on Use',
        content: 'Users must not engage in the following activities:',
        bullets: [
          'Editing or distributing illegal content',
          'Unauthorized use of images that infringe on others\' copyrights',
          'Manipulating the app in an abnormal way or damaging its functions'
        ]
      },
      {
        title: '3. Intellectual Property Rights',
        content: 'All intellectual property rights, such as app design, logos, and source code, belong to CropLab. The rights to images created by editing belong to the user.'
      },
      {
        title: '4. Disclaimer',
        content: 'CropLab does not guarantee the accuracy or stability of the provided service and is not responsible for any data loss that may occur during the use of the service. All editing and saving are performed at the user\'s own responsibility.'
      }
    ],
    footer: 'Thank you for using CropLab.'
  },
  ja: {
    lastUpdated: '最終更新日: 2026年3月25日',
    sections: [
      {
        title: '1. サービスの目的',
        content: 'CropLabは、ユーザーが画像を簡単かつ便利に編集および保存できる機能を提供するサービスです。本規約は、ユーザーがサービスを利用する際に必要な基本事項を規定します。'
      },
      {
        title: '2. サービス利用の制限',
        content: 'ユーザーは、以下の行為を行ってはなりません：',
        bullets: [
          '違法なコンテンツを編集または配布する行為',
          '他人の著作権を侵害する画像を無断で使用する行為',
          'アプリを異常な方法で操作したり、機能を損なったりする行為'
        ]
      },
      {
        title: '3. 知的財産権',
        content: '提供されるアプリのデザイン、ロゴ、ソースコードなどのすべての知的財産権はCropLabに帰属します。編集して作成された画像の権利は、ユーザー自身に帰属します。'
      },
      {
        title: '4. 免責事項',
        content: 'CropLabは、提供されるサービスの正確性や安定性を保証せず、サービスの利用中に発生する可能性のあるデータの損失などについて一切の責任を負いません。すべての編集および保存は、ユーザー自身の責任において行われます。'
      }
    ],
    footer: 'CropLabをご利用いただきありがとうございます。'
  },
  zh: {
    lastUpdated: '最后更新日期：2026年3月25日',
    sections: [
      {
        title: '1. 服务目的',
        content: 'CropLab 提供供用户轻松便捷地编辑和保存图像的功能。本条款规定了用户使用服务所需的基本事项。'
      },
      {
        title: '2. 使用限制',
        content: '用户不得从事以下活动：',
        bullets: [
          '编辑或分发非法内容',
          '擅自使用侵犯他人版权的图像',
          '以异常方式操作应用或破坏其功能'
        ]
      },
      {
        title: '3. 知识产权',
        content: '所提供的应用设计、徽标、源代码等所有知识产权均归 CropLab 所有。编辑生成的图像的权利归用户本人所有。'
      },
      {
        title: '4. 免责声明',
        content: 'CropLab 不保证所提供服务的准确性或稳定性，也不对使用服务过程中可能发生的任何数据损坏负责。所有编辑和保存均由用户自行负责。'
      }
    ],
    footer: '感谢您使用 CropLab。'
  }
};
