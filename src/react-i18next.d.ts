import "react-i18next";
interface ResourceType {
  translation: {
    homepage: {
      hero: { title: string; subtitle: string };
      what_is_sbi: { title: string; p1: string; p2: string };
      simplifying: { title: string; p1: string; p2: string; p3: string };
      how_it_works: {
        title: string;
        intro: string;
        steps: {
          s1_title: string;
          s1_text: string;
          s2_title: string;
          s2_text: string;
          s3_title: string;
          s3_text: string;
          s4_title: string;
          s4_text: string;
          s5_title: string;
          s5_text: string;
          s6_title: string;
          s6_text: string;
          s7_title: string;
          s7_text: string;
          s8_title: string;
          s8_text: string;
        };
      };
      cta: { title: string; intro: string; button: string };
      contact: {
        title: string;
        general: {
          title: string;
          intro: string;
          community_link_text: string;
          discord_link_text: string;
        };
        developers: {
          title: string;
        };
        dev_resources: {
          title: string;
          discord_general_text: string;
          discord_engine_text: string;
          docs_text: string;
          discord_hivesql_text: string;
          npm_package_text: string;
        };
      };
    };
    global: {
      github_label: string;
      hive_label: string;
      homepage_label: string;
    };
    footer: {
      made_by: string; // Esta tiene interpolación, pero sigue siendo string
      powered_by_title: string;
    };
    alt: {
      hive_logo: string;
      keychain_logo: string;
      hivesql_logo: string;
      privex_logo: string;
      tipu_love_title: string;
      tipjar_button_alt: string;
    };
    carousel: {
      paused_message: string;
    };
    search_users_page: {
      title: string;
      options: {
        new_24h_label: string;
        fish_new_label: string;
        fish_new_limit_label: string;
      };
      loading: {
        long_message: string;
      };
      no_results_message: string;
    };
    user_item: {
      tooltip: {
        member: string;
        non_member: string;
        check_membership: string;
      };
      alt: {
        check_membership_icon: string;
      };
      button: {
        onboard: string;
      };
      detail: {
        registered: string;
        first_post: string;
        reputation: string;
        posts: string;
        avg_votes: string;
      };
    };
    sidebar: {
      nav: {
        home: string;
        onboard_user: string;
        search_users: string;
      };
      auth_status: {
        loading: string;
        logged_in_prefix: string;
        logout_button: string;
        go_to_login_button: string;
      };
      alt: {
        hsbi_logo: string;
      };
    };
    backend_status_bar: {
      available_at_prefix: string;
      checking_status_text: string;
      online_status_text: string;
      offline_status_text: string;
    };
    onboarding_list: {
      title: string;
      loading_message: string;
      labels: {
        onboarder: string;
        onboarded: string;
        amount: string;
        memo: string;
        date: string;
      };
      no_records_message: string;
    };
    onboard_user_page: {
      title: string;
      search: {
        placeholder: string;
        button: {
          searching: string;
          checking: string;
          search: string;
        };
        status: {
          searching_hive: string;
        };
        error_prefix: string;
      };
      result: {
        user_found_prefix: string;
        membership: {
          checking: string;
          check_failed_prefix: string;
          already_member: string;
          backend_info: {
            onboarded_by_prefix: string;
            on_date_connector: string;
            missing_comment: {
              message: string;
              edit_button: string;
            };
            comment_posted_prefix: string;
          };
          not_yet_member: string;
          onboard_button: string; // Es string aunque tenga interpolación
        };
      };
      all_records: {
        title: string;
        toggle_button: {
          hide: string;
          show: string;
        };
        no_records_message: string;
      };
    };
    onboard_modal: {
      content_label: string;
      title: string;
      user_info: {
        username_prefix: string;
        onboarder_prefix: string;
      };
      post_selection: {
        keychain_required: string;
        loading_posts: string;
        no_image: string;
        post_author_prefix: string;
        button: {
          onboard_here: string;
          tooltip: {
            keychain_required: string;
          };
        };
        no_recent_posts: string;
      };
      close_button: string;
    };
    stepper: {
      internal_error_step_not_found: string;
      step: string;
      of: string;
      prev: string;
      next: string;
    };
    onboard_step1: {
      title: string;
      intro: {
        p1_prefix: string;
        p2: string;
      };
      prerequisites: {
        p1: string;
        p2: string;
        p3: string;
        p4: string;
        p5: string;
      };
      consent: string;
      keychain_required: string;
      pay_button: string;
      cancel_button: string;
    };
    onboard_step2: {
      default_post_title_prefix: string;
      fetch_posts_error_prefix: string;
      post_comment_errors: {
        token_expired: string;
        no_post_selected: string;
        comment_empty: string;
        keychain_unavailable: string;
        unknown_error: string;
      };
      next_button_text: {
        next: string;
        posting: string;
        posted_success: string;
        try_again: string;
      };
      title: string;
      post_selection: {
        subtitle: string;
        loading: string;
        error_prefix: string;
        no_image: string;
        post_author_prefix: string;
        select_button: string;
        no_recent_posts: string;
      };
      back_button: string;
      comment_editing: {
        subtitle: string;
        commenting_on_prefix: string;
        markdown_title: string;
        markdown_placeholder: string;
        preview_title: string;
        posting_message: string;
        success_message: string;
        error_prefix: string;
      };
      next_button_tooltip: {
        keychain_required: string;
        posting: string;
        posted: string;
        continue: string;
      };
    };
    custom_select: {
      placeholder: string;
    };
  };
  /*
  Si tuvieras otros archivos JSON de traducción con nombres diferentes a translation.json
  (por ejemplo, common.json), agregarías aquí interfaces para ellos al mismo nivel que 'translation'. Por ejemplo:
  common: {
      some_key: string;
  };
  */
}

// Esto extiende el módulo 'react-i18next' para decirle los tipos personalizados
// que estamos usando (nuestro namespace por defecto y nuestra estructura de recursos).
declare module "react-i18next" {
  interface CustomTypeOptions {
    // Especifica el namespace por defecto que estás usando (tu archivo translation.json)
    defaultNS: "translation";
    // Especifica la interfaz que define la estructura de tus recursos (el JSON)
    resources: ResourceType;
  }
}
